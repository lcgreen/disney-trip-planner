import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { AutoSaveIndicator } from "@/components/ui";

interface CountdownHeaderProps {
  name: string;
  isEditingName: boolean;
  editedName: string;
  onNameEdit: () => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: () => void;
  onNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  widgetId?: string | null;
  isEditMode?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
  error?: string | null;
  forceSave?: () => void;
}

export function CountdownHeader({
  name,
  isEditingName,
  editedName,
  onNameEdit,
  onNameChange,
  onNameBlur,
  onNameKeyDown,
  widgetId,
  isEditMode,
  isSaving,
  lastSaved,
  error,
  forceSave,
}: CountdownHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 flex items-center justify-center gap-2">
        <span className="bg-gradient-to-r from-disney-blue via-disney-purple to-disney-pink bg-clip-text text-transparent">
          Disney Countdown Timer
        </span>
      </h1>

      {/* Editable Countdown Name */}
      <div className="flex items-center justify-center gap-2 mt-2">
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={onNameChange}
            onBlur={onNameBlur}
            onKeyDown={onNameKeyDown}
            className="text-2xl md:text-3xl font-bold text-center border-b-2 border-disney-blue bg-transparent focus:outline-none px-2 min-w-[120px]"
            autoFocus
          />
        ) : (
          <>
            <span className="text-2xl md:text-3xl font-bold text-gray-800">
              {name}
            </span>
            <button
              type="button"
              className="ml-1 p-1 rounded hover:bg-gray-100"
              onClick={onNameEdit}
              title="Edit name"
            >
              <Pencil className="w-5 h-5 text-gray-500" />
            </button>
          </>
        )}
      </div>

      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
        Count down to your magical Disney adventure with style and excitement
      </p>

      {/* Auto-save indicator for widget editing */}
      {widgetId && isEditMode && (
        <div className="mt-4 flex justify-center gap-4">
          <AutoSaveIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={error}
            className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm"
          />
        </div>
      )}
    </motion.div>
  );
}
