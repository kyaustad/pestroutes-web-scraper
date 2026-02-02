"use client";

import { useState, FormEvent } from "react";
import { fetchKnockingReport } from "@/features/pestroutes/pin-scraping/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

export default function PestRoutesPage() {
  const [company, setCompany] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchKnockingReport({ company, username, password });
      setData(rows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-4">
      {/* back button */}
      <Button onClick={() => router.back()}>
        <ArrowLeftIcon className="size-4" />
        Back
      </Button>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="flex flex-col gap-2">
          <Label>Company Code</Label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Username</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Fetch Report"}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </form>

      {data.length > 0 && (
        // get total row count
        <>
          <div className="text-sm text-muted-foreground">
            Total rows: {data.length}
          </div>
          <Table className="mt-8">
            <TableHeader>
              <TableRow>
                {data[0].map((header, i) => (
                  <TableHead key={i}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(1).map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
