import React from 'react';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0 border-none"
      />
      <Input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-20"
      />
    </div>
  );
};

