import { useState } from "react";
import DateTimePicker from "react-weblineindia-time-picker";
import "./datetimepicker.css";
import { Box, Button, HStack, Input } from "@chakra-ui/react";
import { days } from "../../../utils/Constants";

const TimePicker = ({ value, label, selectedDays, isNew, handleChange, toggle, handleDelete }) => {
  const [tempTime, setTempTime] = useState(value ?? new Date());
  const [tempLabel, setTempLabel] = useState(label || "");
  const [tempSelectedDays, setTempSelectedDays] = useState(selectedDays || days.map(day => day.value));

  const handleSelect = (time) => {
    setTempTime(time.value);
  };

  const handleOk = () => {
    if (handleChange) {
      handleChange(tempTime, tempSelectedDays, tempLabel);
    }
  };

  const handleCancel = () => {
    setTempTime(value ?? new Date());
    if (toggle) toggle();
  };

  const handleDayClick = (day) => {
    if (tempSelectedDays.includes(day.value)) {
      setTempSelectedDays(tempSelectedDays.filter((d) => d !== day.value));
    } else {
      setTempSelectedDays([...tempSelectedDays, day.value]);
    }
  };

  return (
    <div className="overlay-picker">
      <div className="picker">
        <DateTimePicker
          hourFormat="12"
          value={tempTime}
          onChange={handleSelect}
          timeOnly
        />
        <HStack justify="space-between" alignItems="center" my="4">
          <HStack spacing={2.5} justify="center" >
            {days?.map((day) => (
              <Button
                key={day.value}
                variant={
                  tempSelectedDays?.includes(day.value)
                    ? "solidPrimary"
                    : "outlinePrimary"
                }
                borderRadius="100%"
                w="30px"
                minW="30px"
                h="30px"
                px="0"
                fontSize="14px"
                onClick={() => handleDayClick(day)}
              >
                {day.label}
              </Button>
            ))}
          </HStack>
        </HStack>
        <HStack alignItems="center" justify="space-between" my="5">
          <Box fontWeight="bold" w="40%">Label:</Box>
          <Input
            textAlign="right"
            placeholder="Add Label"
            variant="unstyled"
            fontSize="0.85rem"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
          />
        </HStack>
        <HStack mt="8">
          {!isNew && (
            <Button
              textStyle="semi"
              fontSize="14px"
              border="1px"
              borderColor="danger"
              color="danger"
              bg="white"
              h="8"
              w="80px"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <HStack marginLeft="auto">
            <Button
              onClick={handleCancel}
              h="8"
              w="90px"
              textStyle="light"
              fontSize="14px"
              _focus={{ bg: "white" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOk}
              h="8"
              w="70px"
              textStyle="light"
              fontSize="14px"
              variant="primary"
            >
              OK
            </Button>
          </HStack>
        </HStack>
      </div>
    </div>
  );
};

export default TimePicker;
