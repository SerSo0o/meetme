import { View, Text, TouchableOpacity } from "react-native";
import type { UserStatus } from "@/types/profile";
import { colors } from "@/constants/theme";

const STATUS_OPTIONS: { value: UserStatus; label: string; color: string; description: string }[] = [
  { value: "green", label: "Green", color: colors.statusGreen, description: "Open to meet" },
  { value: "yellow", label: "Yellow", color: colors.statusYellow, description: "Busy but open" },
  { value: "red", label: "Red", color: colors.statusRed, description: "Ghost mode" },
];

type StatusToggleProps = {
  value: UserStatus;
  onChange: (status: UserStatus) => void;
  disabled?: boolean;
};

export function StatusToggle({ value, onChange, disabled }: StatusToggleProps) {
  return (
    <View className="flex-row gap-3">
      {STATUS_OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            disabled={disabled}
            activeOpacity={0.7}
            className={`flex-1 rounded-xl py-3 items-center border-2 ${
              isActive ? "border-opacity-100" : "border-slate-200"
            }`}
            style={{
              borderColor: isActive ? opt.color : "#e2e8f0",
              backgroundColor: isActive ? opt.color + "15" : "#ffffff",
            }}
          >
            <View
              className="w-4 h-4 rounded-full mb-1"
              style={{ backgroundColor: opt.color }}
            />
            <Text
              className={`text-xs font-semibold ${
                isActive ? "text-slate-800" : "text-slate-400"
              }`}
            >
              {opt.label}
            </Text>
            <Text className="text-[10px] text-slate-400 mt-0.5">
              {opt.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
