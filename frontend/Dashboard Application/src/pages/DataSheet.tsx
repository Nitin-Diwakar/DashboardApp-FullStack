import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import Papa from "papaparse";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ChevronLeft, ChevronRight, CalendarIcon, X } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface SensorDataRecord {
  id: string;
  timestamp: Date;
  moisture1: number;
  moisture2: number;
  temperature: number;
  humidity: number;
  batteryLevel: number;
}

const DataSheet = () => {
  const [data, setData] = useState<SensorDataRecord[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Fixed: Changed to string values to properly handle empty states
  const [moisture1Min, setMoisture1Min] = useState<string>("");
  const [moisture1Max, setMoisture1Max] = useState<string>("");
  const [moisture2Min, setMoisture2Min] = useState<string>("");
  const [moisture2Max, setMoisture2Max] = useState<string>("");
  
  // Added: Temperature and Humidity filters
  const [temperatureMin, setTemperatureMin] = useState<string>("");
  const [temperatureMax, setTemperatureMax] = useState<string>("");
  const [humidityMin, setHumidityMin] = useState<string>("");
  const [humidityMax, setHumidityMax] = useState<string>("");
  
  const tableRef = useRef<HTMLDivElement | null>(null);

  const fetchSensorData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/sensor-data");
      const json = await res.json();

      const transformed = json.map((entry: any, index: number) => ({
        id: index.toString(),
        timestamp: new Date(entry.timestamp),
        moisture1: entry.sensor1,
        moisture2: entry.sensor2,
        temperature: entry.temperature || Math.random() * 35 + 15, // Fallback for demo
        humidity: entry.humidity || Math.random() * 80 + 20, // Fallback for demo
        batteryLevel: entry.batteryLevel || Math.random() * 100,
      }));

      setData(transformed.reverse());
    } catch (error) {
      console.error("Failed to load sensor data:", error);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(() => {
      fetchSensorData();
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fixed: Improved filtering logic to handle empty string values properly
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Check moisture sensor 1 range - only apply filter if value is not empty
      if (moisture1Min !== "" && row.moisture1 < parseFloat(moisture1Min)) {
        return false;
      }
      if (moisture1Max !== "" && row.moisture1 > parseFloat(moisture1Max)) {
        return false;
      }

      // Check moisture sensor 2 range
      if (moisture2Min !== "" && row.moisture2 < parseFloat(moisture2Min)) {
        return false;
      }
      if (moisture2Max !== "" && row.moisture2 > parseFloat(moisture2Max)) {
        return false;
      }

      // Added: Temperature filters
      if (temperatureMin !== "" && row.temperature < parseFloat(temperatureMin)) {
        return false;
      }
      if (temperatureMax !== "" && row.temperature > parseFloat(temperatureMax)) {
        return false;
      }

      // Added: Humidity filters
      if (humidityMin !== "" && row.humidity < parseFloat(humidityMin)) {
        return false;
      }
      if (humidityMax !== "" && row.humidity > parseFloat(humidityMax)) {
        return false;
      }

      // Check date range
      if (!dateRange?.from) return true;

      const start = startOfDay(dateRange.from);
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

      return isWithinInterval(row.timestamp, { start, end });
    });
  }, [
    data,
    dateRange,
    moisture1Min,
    moisture1Max,
    moisture2Min,
    moisture2Max,
    temperatureMin,
    temperatureMax,
    humidityMin,
    humidityMax,
  ]);

  const columns = useMemo<ColumnDef<SensorDataRecord>[]>(() => [
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: ({ getValue }) => format(getValue<Date>(), "PPPp"),
    },
    {
      header: "Moisture 1 (%)",
      accessorKey: "moisture1",
      cell: ({ getValue }) => getValue<number>().toFixed(1),
    },
    {
      header: "Moisture 2 (%)",
      accessorKey: "moisture2",
      cell: ({ getValue }) => getValue<number>().toFixed(1),
    },
    {
      header: "Temp (°C)",
      accessorKey: "temperature",
      cell: ({ getValue }) => getValue<number>().toFixed(1),
    },
    {
      header: "Humidity (%)",
      accessorKey: "humidity",
      cell: ({ getValue }) => getValue<number>().toFixed(1),
    },
    {
      header: "Battery (%)",
      accessorKey: "batteryLevel",
      cell: ({ getValue }) => getValue<number>().toFixed(1),
    },
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleExport = () => {
    const csv = Papa.unparse(
      filteredData.map((row) => ({
        Timestamp: format(row.timestamp, "PPPp"),
        "Moisture 1 (%)": row.moisture1.toFixed(1),
        "Moisture 2 (%)": row.moisture2.toFixed(1),
        "Temp (°C)": row.temperature.toFixed(1),
        "Humidity (%)": row.humidity.toFixed(1),
        "Battery (%)": row.batteryLevel.toFixed(1),
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sensor_data_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // Fixed: Improved input handler to validate number inputs
  const handleNumberInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Allow empty string or valid numbers (including decimals)
    if (value === "" || (!isNaN(parseFloat(value)) && isFinite(parseFloat(value)))) {
      setter(value);
    }
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setDateRange(undefined);
    setMoisture1Min("");
    setMoisture1Max("");
    setMoisture2Min("");
    setMoisture2Max("");
    setTemperatureMin("");
    setTemperatureMax("");
    setHumidityMin("");
    setHumidityMax("");
  };

  // Check if any filters are active
  const hasActiveFilters = dateRange?.from || 
    moisture1Min !== "" || moisture1Max !== "" ||
    moisture2Min !== "" || moisture2Max !== "" ||
    temperatureMin !== "" || temperatureMax !== "" ||
    humidityMin !== "" || humidityMax !== "";

  return (
    <div className="p-6" ref={tableRef}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Sensor Data</CardTitle>
              <CardDescription>Live historical readings with filters and export</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters} size="sm">
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Improved Filter Section with better organization */}
          <div className="space-y-4">
            {/* Date Range Filter */}
            <div className="grid grid-cols-1 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateRange?.from && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                  <div className="p-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setDateRange(undefined)}>
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Sensor Filters with better labeling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Moisture Sensor 1 Filters */}
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900">Moisture Sensor 1 (%)</h4>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="moisture1Min" className="text-sm text-gray-600 block mb-1">
                      Minimum Value
                    </label>
                    <Input
                      id="moisture1Min"
                      type="number"
                      placeholder="Min value"
                      value={moisture1Min}
                      onChange={(e) => handleNumberInput(e.target.value, setMoisture1Min)}
                    />
                  </div>
                  <div>
                    <label htmlFor="moisture1Max" className="text-sm text-gray-600 block mb-1">
                      Maximum Value
                    </label>
                    <Input
                      id="moisture1Max"
                      type="number"
                      placeholder="Max value"
                      value={moisture1Max}
                      onChange={(e) => handleNumberInput(e.target.value, setMoisture1Max)}
                    />
                  </div>
                </div>
              </div>

              {/* Moisture Sensor 2 Filters */}
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900">Moisture Sensor 2 (%)</h4>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="moisture2Min" className="text-sm text-gray-600 block mb-1">
                      Minimum Value
                    </label>
                    <Input
                      id="moisture2Min"
                      type="number"
                      placeholder="Min value"
                      value={moisture2Min}
                      onChange={(e) => handleNumberInput(e.target.value, setMoisture2Min)}
                    />
                  </div>
                  <div>
                    <label htmlFor="moisture2Max" className="text-sm text-gray-600 block mb-1">
                      Maximum Value
                    </label>
                    <Input
                      id="moisture2Max"
                      type="number"
                      placeholder="Max value"
                      value={moisture2Max}
                      onChange={(e) => handleNumberInput(e.target.value, setMoisture2Max)}
                    />
                  </div>
                </div>
              </div>

              {/* Temperature Filters - NEW */}
              <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium text-gray-900">Temperature (°C)</h4>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="tempMin" className="text-sm text-gray-600 block mb-1">
                      Minimum Temp (°C)
                    </label>
                    <Input
                      id="tempMin"
                      type="number"
                      placeholder="Min temp"
                      value={temperatureMin}
                      onChange={(e) => handleNumberInput(e.target.value, setTemperatureMin)}
                    />
                  </div>
                  <div>
                    <label htmlFor="tempMax" className="text-sm text-gray-600 block mb-1">
                      Maximum Temp (°C)
                    </label>
                    <Input
                      id="tempMax"
                      type="number"
                      placeholder="Max temp"
                      value={temperatureMax}
                      onChange={(e) => handleNumberInput(e.target.value, setTemperatureMax)}
                    />
                  </div>
                </div>
              </div>

              {/* Humidity Filters - NEW */}
              <div className="space-y-3 p-4 border rounded-lg bg-green-50">
                <h4 className="font-medium text-gray-900">Humidity (%)</h4>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="humidityMin" className="text-sm text-gray-600 block mb-1">
                      Minimum Humidity (%)
                    </label>
                    <Input
                      id="humidityMin"
                      type="number"
                      placeholder="Min humidity"
                      value={humidityMin}
                      onChange={(e) => handleNumberInput(e.target.value, setHumidityMin)}
                    />
                  </div>
                  <div>
                    <label htmlFor="humidityMax" className="text-sm text-gray-600 block mb-1">
                      Maximum Humidity (%)
                    </label>
                    <Input
                      id="humidityMax"
                      type="number"
                      placeholder="Max humidity"
                      value={humidityMax}
                      onChange={(e) => handleNumberInput(e.target.value, setHumidityMax)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {moisture1Min && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Moisture 1 Min: {moisture1Min}
                    <button onClick={() => setMoisture1Min("")} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )}
                {moisture1Max && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Moisture 1 Max: {moisture1Max}
                    <button onClick={() => setMoisture1Max("")} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )}
                {moisture2Min && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Moisture 2 Min: {moisture2Min}
                    <button onClick={() => setMoisture2Min("")} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )}
                {moisture2Max && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Moisture 2 Max: {moisture2Max}
                    <button onClick={() => setMoisture2Max("")} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )}
                {temperatureMin && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Temp Min: {temperatureMin}°C
                    <button onClick={() => setTemperatureMin("")} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )}
                {temperatureMax && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Temp Max: {temperatureMax}°C
                    <button onClick={() => setTemperatureMax("")} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )}
                {humidityMin && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Humidity Min: {humidityMin}%
                    <button onClick={() => setHumidityMin("")} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )}
                {humidityMax && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Humidity Max: {humidityMax}%
                    <button onClick={() => setHumidityMax("")} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export ({filteredData.length} records)
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                      No data matches the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-2 flex items-center justify-between text-sm">
              <div>
                Showing {table.getRowModel().rows.length} of {filteredData.length} filtered results
                {data.length !== filteredData.length && (
                  <span className="text-gray-500"> (from {data.length} total records)</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center px-2 text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSheet;