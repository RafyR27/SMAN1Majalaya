"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  ChevronDownIcon,
  XIcon,
  CheckIcon,
  SearchIcon,
  PlusIcon,
  ChevronsUpDownIcon,
  CornerDownLeftIcon,
} from "lucide-react";
import {
  addMasterDataItem,
  DEFAULT_MASTER_DATA,
  type MasterDataType,
} from "@/lib/master-data";
import { IKategori, IKodeRekening, ISatuan } from "@/types/settings";
import {
  useAddKategori,
  useAddRekening,
  useAddSatuan,
} from "@/components/views/Settings/AddItem/useAddItem";

const Combobox = ComboboxPrimitive.Root;

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  return (
    <InputGroup className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            render={<ComboboxTrigger />}
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            "group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  );
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  );
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 outline-none", className)}
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export interface ComboboxOption {
  value: string;
  label: string;
}

export type ComboboxType = MasterDataType;

export const DEFAULT_COMBOBOX_OPTIONS: Record<ComboboxType, string[]> =
  DEFAULT_MASTER_DATA;

interface IComboboxList {
  kodeRekening: IKodeRekening[];
  kategori: IKategori[];
  satuan: ISatuan[];
}

export interface ComboboxCreateProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  type?: ComboboxType;
  options?: (string | ComboboxOption)[];
  onAddNewOption?: (newOption: string) => void;
  comboboxList?: IComboboxList;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  showDescription?: boolean;
  hideCreate?: boolean;
}

function ComboboxCreate({
  id,
  value,
  onChange,
  type,
  options,
  onAddNewOption,
  comboboxList,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari atau ketik baru...",
  emptyText = "Tidak ada hasil ditemukan",
  className,
  disabled = false,
  hideCreate = false,
}: ComboboxCreateProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreatingInline, setIsCreatingInline] = React.useState(false);
  const [inlineNewValue, setInlineNewValue] = React.useState("");

  const { handleAddRekening, isPendingAddRekening } = useAddRekening();
  const { handleAddKategori, isPendingAddKategori } = useAddKategori();
  const { handleAddSatuan, isPendingAddSatuan } = useAddSatuan();

  // Reaktif terhadap master data store
  const masterStore = comboboxList;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const inlineInputRef = React.useRef<HTMLInputElement>(null);

  // Resolve type automatically from prop or id
  const resolvedType: ComboboxType | undefined = React.useMemo(() => {
    if (type) return type;
    const lowerId = id?.toLowerCase() || "";
    if (lowerId.includes("rekening")) return "kodeRekening";
    if (lowerId.includes("kategori")) return "kategori";
    if (lowerId.includes("satuan")) return "satuan";
    return undefined;
  }, [type, id]);

  // Merge options: custom prop > master store (API list + defaults)
  const allOptions: ComboboxOption[] = React.useMemo(() => {
    if (options && options.length > 0) {
      return options.map((item) => {
        if (typeof item === "string") {
          return { value: item, label: item };
        }
        return item;
      });
    }

    if (resolvedType && masterStore?.[resolvedType]) {
      const list = masterStore[resolvedType];
      if (resolvedType === "kodeRekening") {
        return (list as IKodeRekening[]).map((item) => ({
          value: item.id,
          label: item.kodeRekening,
        }));
      }
      if (resolvedType === "kategori") {
        return (list as IKategori[]).map((item) => ({
          value: item.id,
          label: item.kategori,
        }));
      }
      if (resolvedType === "satuan") {
        return (list as ISatuan[]).map((item) => ({
          value: item.id,
          label: item.satuan,
        }));
      }
    }

    return [];
  }, [options, resolvedType, masterStore]);

  const filteredOptions = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allOptions;
    return allOptions.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(query);
      const matchValue = opt.value.toLowerCase().includes(query);
      return matchLabel || matchValue;
    });
  }, [allOptions, searchQuery]);

  const exactMatchExists = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return false;
    return allOptions.some(
      (opt) =>
        opt.value.toLowerCase() === query || opt.label.toLowerCase() === query,
    );
  }, [allOptions, searchQuery]);

  // Handle click outside untuk menutup popup
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Auto fokus saat open
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery("");
      setIsCreatingInline(false);
      setInlineNewValue("");
    }
  }, [open]);

  React.useEffect(() => {
    if (isCreatingInline) {
      setTimeout(() => {
        inlineInputRef.current?.focus();
      }, 50);
    }
  }, [isCreatingInline]);

  const handleAddNew = (newVal: string) => {
    const trimmed = newVal.trim();
    if (!trimmed) return;

    if (resolvedType === "kodeRekening") {
      handleAddRekening({ kodeRekening: trimmed });
    } else if (resolvedType === "kategori") {
      handleAddKategori({ kategori: trimmed });
    } else if (resolvedType === "satuan") {
      handleAddSatuan({ satuan: trimmed });
    } else if (resolvedType) {
      // Simpan ke master store yang persisten
      addMasterDataItem(resolvedType, trimmed);
    }

    if (onAddNewOption) {
      onAddNewOption(trimmed);
    }
    setOpen(false);
  };

  const handleSelectOption = (optValue: string) => {
    onChange(optValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-xs transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left font-normal cursor-pointer",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <span
          className={cn("truncate flex-1", !value && "text-muted-foreground")}
        >
          {value
            ? (allOptions.find((opt) => opt.value === value)?.label ?? value)
            : placeholder}
        </span>
        <ChevronsUpDownIcon className="h-3.5 w-3.5 shrink-0 opacity-50 text-muted-foreground ml-2" />
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute top-full left-0 z-70 mt-1.5 w-full min-w-[17rem] max-w-[24rem] overflow-hidden rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Search Input Bar */}
          <div className="flex items-center border-b border-border/80 px-2.5 py-2 bg-muted/20">
            <SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filteredOptions.length === 1) {
                    handleSelectOption(filteredOptions[0].value);
                  } else if (!exactMatchExists && searchQuery.trim()) {
                    handleAddNew(searchQuery);
                  }
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground rounded p-0.5 ml-1 cursor-pointer"
              >
                <XIcon className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Action: Tambah baru langsung dari search query jika belum ada match persis */}
          {!exactMatchExists && searchQuery.trim().length > 0 && (
            <div className="p-1.5 border-b border-border/60 bg-primary/5">
              <button
                type="button"
                onClick={() => handleAddNew(searchQuery)}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    Tambah &quot;<strong>{searchQuery.trim()}</strong>&quot;
                  </span>
                </div>
                <span className="text-[10px] text-primary/70 shrink-0 font-mono flex items-center gap-0.5">
                  Enter <CornerDownLeftIcon className="h-2.5 w-2.5" />
                </span>
              </button>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected =
                  (value || "").toLowerCase() === opt.value.toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-[0.8rem] text-left transition-colors cursor-pointer",
                      isSelected
                        ? "bg-primary/15 font-medium"
                        : "hover:bg-muted text-foreground",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate leading-tight font-medium">
                        {opt.label}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckIcon className="h-3.5 w-3.5 shrink-0 text-current ml-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer: Tombol kecil "+ Tambah baru" atau Inline Create Form */}
          {!hideCreate && (
            <div className="border-t border-border/80 bg-muted/10">
              {isCreatingInline ? (
                <div className="space-y-1.5 p-2 bg-background shadow-xs">
                  <p className="text-sm font-medium text-muted-foreground px-1">
                    Ketik nilai baru:
                  </p>
                  <div className="flex flex-col items-center gap-1.5">
                    <input
                      ref={inlineInputRef}
                      value={inlineNewValue}
                      onChange={(e) => setInlineNewValue(e.target.value)}
                      placeholder="Ketik di sini..."
                      className="h-7 w-full text-sm rounded-md border border-input bg-background px-2 text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNew(inlineNewValue);
                        } else if (e.key === "Escape") {
                          setIsCreatingInline(false);
                        }
                      }}
                    />
                    <div className="flex gap-2 justify-end w-full">
                      <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={() => {
                          setIsCreatingInline(false);
                          setInlineNewValue("");
                        }}
                        className="h-7 px-2 text-xs rounded-md shrink-0 cursor-pointer text-muted-foreground"
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        onClick={() => handleAddNew(inlineNewValue)}
                        disabled={
                          !inlineNewValue.trim() ||
                          isPendingAddRekening ||
                          isPendingAddKategori ||
                          isPendingAddSatuan
                        }
                        className="h-7 px-2.5 text-xs rounded-md shrink-0 cursor-pointer"
                      >
                        {isPendingAddRekening && resolvedType === "kodeRekening"
                          ? "Menyimpan..."
                          : "Simpan"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant={"ghost"}
                  onClick={() => {
                    setIsCreatingInline(true);
                    setInlineNewValue(searchQuery);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-b-lg rounded-t-none text-xs font-medium text-muted-foreground hover:bg-muted-foreground/10 transition-colors cursor-pointer border-none"
                >
                  <PlusIcon className="h-2 w-2" />
                  <span>Tambah baru</span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxCreate,
  useComboboxAnchor,
};
