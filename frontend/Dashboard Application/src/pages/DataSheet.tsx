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
import { Download, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
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
  const [moisture1Min, setMoisture1Min] = useState(0);
  const [moisture1Max, setMoisture1Max] = useState(100);
  const [moisture2Min, setMoisture2Min] = useState(0);
  const [moisture2Max, setMoisture2Max] = useState(100);
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
        temperature: 0,
        humidity: 0,
        batteryLevel: 0,
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

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Check moisture sensor 1 range
      if (row.moisture1 < moisture1Min || row.moisture1 > moisture1Max) {
        return false;
      }

      // Check moisture sensor 2 range
      if (row.moisture2 < moisture2Min || row.moisture2 > moisture2Max) {
        return false;
      }

      // Check date range
      if (!dateRange?.from) return true;

      const start = startOfDay(dateRange.from);
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

      return isWithinInterval(row.timestamp, { start, end });
    });
  }, [data, dateRange, moisture1Min, moisture1Max, moisture2Min, moisture2Max]);

  const columns = useMemo<ColumnDef<SensorDataRecord>[]>(() => [
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: ({ getValue }) => format(getValue<Date>(), "PPPp"),
    },
    {
      header: "Moisture 1 (%)",
      accessorKey: "moisture1",
    },
    {
      header: "Moisture 2 (%)",
      accessorKey: "moisture2",
    },
    {
      header: "Temp (°C)",
      accessorKey: "temperature",
    },
    {
      header: "Humidity (%)",
      accessorKey: "humidity",
    },
    {
      header: "Battery (%)",
      accessorKey: "batteryLevel",
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
        "Moisture 1 (%)": row.moisture1,
        "Moisture 2 (%)": row.moisture2,
        "Temp (°C)": row.temperature,
        "Humidity (%)": row.humidity,
        "Battery (%)": row.batteryLevel,
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sensor_data.csv");
    link.click();
  };

  return (
    <div className="p-6" ref={tableRef}>
      <Card>
        <CardHeader>
          <CardTitle>Sensor Data</CardTitle>
          <CardDescription>Live historical readings with filters and export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="flex gap-2 flex-col">
              <label htmlFor="moisture1Min">Moisture Sensor 1 Min</label>
              <Input
                id="moisture1Min"
                type="number"
                placeholder="Moisture Sensor 1 Min"
                value={moisture1Min === 0 ? "" : moisture1Min}
                onChange={(e) => setMoisture1Min(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="moisture1Max">Moisture Sensor 1 Max</label>
              <Input
                id="moisture1Max"
                type="number"
                placeholder="Moisture Sensor 1 Max"
                value={moisture1Max === 100 ? "" : moisture1Max}
                onChange={(e) => setMoisture1Max(Number(e.target.value))}
              />
            </div>

            <div className="flex gap-2 flex-col">
              <label htmlFor="moisture2Min">Moisture Sensor 2 Min</label>
              <Input
                id="moisture2Min"
                type="number"
                placeholder="Moisture Sensor 2 Min"
                value={moisture2Min === 0 ? "" : moisture2Min}
                onChange={(e) => setMoisture2Min(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="moisture2Max">Moisture Sensor 2 Max</label>
              <Input
                id="moisture2Max"
                type="number"
                placeholder="Moisture Sensor 2 Max"
                value={moisture2Max === 100 ? "" : moisture2Max}
                onChange={(e) => setMoisture2Max(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-2 flex items-center justify-between text-sm">
              <div>
                Showing {table.getRowModel().rows.length} of {filteredData.length} filtered results
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
      <div className="flex justify-end mt-2">
        <Button
          variant="ghost"
          onClick={() => {
            setDateRange(undefined);
            setMoisture1Min(0);
            setMoisture1Max(100);
            setMoisture2Min(0);
            setMoisture2Max(100);
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default DataSheet;

