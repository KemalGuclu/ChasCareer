"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type ImportResult = {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
};

type Props = {
  onImportComplete: () => void;
};

export function ImportCompaniesDialog({ onImportComplete }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/companies/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          imported: data.imported,
          skipped: data.skipped,
          errors: data.errors || [],
        });
        if (data.imported > 0) {
          onImportComplete();
          toast.success(`${data.imported} företag importerade!`);
        }
      } else {
        setResult({
          success: false,
          imported: 0,
          skipped: 0,
          errors: [data.error || "Import misslyckades"],
        });
      }
    } catch {
      setResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: ["Nätverksfel"],
      });
    }

    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => o ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importera CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importera företag från CSV</DialogTitle>
          <DialogDescription>
            Ladda upp en CSV-fil med företagsinformation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">CSV-format (kolumner):</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>name</strong> (eller namn, företag) - Obligatoriskt</li>
              <li><strong>city</strong> (eller stad, ort) - Obligatoriskt</li>
              <li><strong>industry</strong> (eller bransch) - Valfritt</li>
              <li><strong>size</strong> (eller storlek) - Valfritt</li>
              <li><strong>website</strong> (eller webbplats, hemsida) - Valfritt</li>
              <li><strong>description</strong> (eller beskrivning) - Valfritt</li>
            </ul>
          </div>

          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-medium">{file.name}</span>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Klicka eller dra en CSV-fil hit
                </p>
              </div>
            )}
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${result.success ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                  {result.success ? "Import klar!" : "Import misslyckades"}
                </span>
              </div>
              {result.success && (
                <p className="text-sm text-green-700">
                  {result.imported} företag importerade, {result.skipped} överhoppade
                </p>
              )}
              {result.errors.length > 0 && (
                <ul className="text-xs text-red-600 mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Stäng
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Importerar..." : "Importera"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
