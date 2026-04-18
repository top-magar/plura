"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-modal";
import MediaCard from "./media-card";
import UploadMediaForm from "./upload-media-form";
import type { Media } from "@/lib/generated/prisma/client";

type Props = {
  data: { Media: Media[] } | null;
  subAccountId: string;
};

export default function MediaBucket({ data, subAccountId }: Props) {
  const { setOpen } = useModal();
  const [search, setSearch] = useState("");

  const media = data?.Media ?? [];
  const filtered = media.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Media Bucket</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {media.length} file{media.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() =>
            setOpen(
              <CustomModal title="Upload Media" subheading="Upload a file to your media bucket">
                <UploadMediaForm subAccountId={subAccountId} />
              </CustomModal>
            )
          }
        >
          <Plus /> Upload
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((file) => (
            <MediaCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-[13px] text-muted-foreground">
            {search ? "No files match your search" : "No media files yet"}
          </p>
          {!search && (
            <Button
              variant="link"
              className="mt-2"
              onClick={() =>
                setOpen(
                  <CustomModal title="Upload Media" subheading="Upload a file to your media bucket">
                    <UploadMediaForm subAccountId={subAccountId} />
                  </CustomModal>
                )
              }
            >
              Upload your first file
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
