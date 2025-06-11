"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { usePartner } from "@/context/partner-context";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";

export function CreatePartnerButton() {
  const [open, setOpen] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { create } = usePartner();

  async function handleCreate() {
    setLoading(true);
    try {
      let logoDataUrl = logo;
      if (logoFile) {
        logoDataUrl = await fileToDataUrl(logoFile);
      }
      await create({
        nameEn,
        nameAr,
        logo: logoDataUrl,
        createdAt: new Date().toISOString(),
      });
      setOpen(false);
      setNameEn("");
      setNameAr("");
      setLogo("");
      setLogoFile(null);
      setLogoPreview("");
    } finally {
      setLoading(false);
    }
  }

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoPreview(ev.target?.result as string);
        setLogo(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview("");
      setLogo("");
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="mt-8 ms-auto flex max-sm:w-full">
          Create <PlusCircle />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Partner</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="English Name"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
          />
          <Input
            placeholder="Arabic Name"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
          />
          <div>
            <Label htmlFor="logo-upload">Logo</Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              required
            />
            {logoPreview && (
              <div className="mt-2">
                <Image
                  src={logoPreview}
                  alt="Logo Preview"
                  height={64}
                  width={64}
                  className="rounded-full object-cover border min-h-16"
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={loading || !nameEn || !nameAr || !logo}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
