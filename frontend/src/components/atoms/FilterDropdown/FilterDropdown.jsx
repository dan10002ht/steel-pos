import React, { useState } from "react";
import {
  Button,
  Text,
} from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import Popover from "../Popover";
import ActionList from "../ActionList";

const FilterDropdown = ({
  label = "Filter",
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  size = "md",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const actionList = options.map(option => ({
    label: option.label,
    value: option.value,
    onClick: () => handleOptionClick(option),
  }));

  return (
    <Popover
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      placement="bottom-start"
      activator={
        <Button
          variant="outline"
          minW="100px"
          size={size}
          rightIcon={<ChevronDown size={16} />}
          onClick={() => setIsOpen(!isOpen)}
          {...props}
        >
          <Text noOfLines={1}>
            {label}: {displayText}
          </Text>
        </Button>
      }
    >
      <ActionList
        actions={actionList}
        onActionClick={handleOptionClick}
        size={size}
      />
    </Popover>
  );
};

export default FilterDropdown;
