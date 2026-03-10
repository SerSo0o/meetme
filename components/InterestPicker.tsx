import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import type { Interest } from "@/types/profile";

type InterestPickerProps = {
  allInterests: Interest[];
  selectedIds: string[];
  onToggle: (interestId: string) => void;
  disabled?: boolean;
};

export function InterestPicker({
  allInterests,
  selectedIds,
  onToggle,
  disabled,
}: InterestPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {allInterests.map((interest) => {
        const isSelected = selectedIds.includes(interest.id);
        return (
          <TouchableOpacity
            key={interest.id}
            onPress={() => onToggle(interest.id)}
            disabled={disabled}
            activeOpacity={0.7}
            className={`px-4 py-2 rounded-full border ${
              isSelected
                ? "bg-indigo-500 border-indigo-500"
                : "bg-white border-slate-200"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isSelected ? "text-white" : "text-slate-600"
              }`}
            >
              {interest.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
