import React from "react";
import { FormControl, FormLabel, Select, Input } from "@chakra-ui/react";

const SalesFilterField = ({ 
  type, 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Tất cả",
  minW = { base: "100%", sm: "200px" },
  maxW = { base: "100%", md: "200px" }
}) => {
  if (type === "date") {
    return (
      <FormControl minW={minW} maxW={maxW}>
        <FormLabel fontSize="sm">{label}</FormLabel>
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </FormControl>
    );
  }

  return (
    <FormControl minW={minW} maxW={maxW}>
      <FormLabel fontSize="sm">{label}</FormLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default SalesFilterField;
