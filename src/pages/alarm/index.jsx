import { useState, useEffect } from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  Switch,
  Text,
  Input,
  Image,
  Collapse,
  useColorMode,
  useColorModeValue
} from "@chakra-ui/react";
import moment from "moment";
import useIcons from "../../assets/icons";
import { Howl } from "howler";

import TimePicker from "../../components/commons/DateTimePicker/TimePicker";
import { days } from "../../utils/Constants";
import ConfirmationModal from "../../components/commons/Modal/ConfirmationModal";
import notifications from './notification.ts';
import { customAlphabet } from 'nanoid/non-secure'
const nanoid = customAlphabet('1234567890', 6)

const Index = () => {
  const icons = useIcons()
  const { colorMode } = useColorMode()
  const excludeElements = ['input', 'button', 'switch', 'label-icon', 'delete-icon'];
  const [collapsedIndex, setCollapsedIndex] = useState(null);
  const [isOpenTime, setIsOpenTime] = useState(false);
  const [currentAlarmTime, setCurrentAlarmTime] = useState(null);
  const [currentAlarmIndex, setCurrentAlarmIndex] = useState(null);
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
  const [indexDataDeleted, setIndexDataDeleted] = useState(null)
  const [dataAlarm, setDataAlarm] = useState(
    JSON.parse(localStorage.getItem("alarm_data")) ?? []
  );

  useEffect(() => {
    localStorage.setItem("alarm_data", JSON.stringify(dataAlarm));
  }, [dataAlarm]);

  const stopPropagation = (handler) => (event) => {
    event.stopPropagation();
    handler(event);
  };

  const handleCollapseAlarm = (event, indexAlarm) => {
    if (excludeElements.includes(event.target.localName)) {
      return;
    }

    if (collapsedIndex === indexAlarm) setCollapsedIndex(null);
    else setCollapsedIndex(indexAlarm);
  };

  const handleChangeLabel = (value, index) => {
    setDataAlarm(
      dataAlarm.map((alarm, i) => {
        if (i === index) alarm.label = value;
        return alarm;
      })
    )
  }

  const handleClickDay = (day, index) => {
    setDataAlarm((prevData) =>
      prevData.map((alarm, i) =>
        i === index
          ? {
              ...alarm,
              selectedDays: alarm.selectedDays.includes(day.value)
                ? alarm.selectedDays.filter((d) => d !== day.value)
                : [...alarm.selectedDays, day.value],
            }
          : alarm
      )
    );
  };

  const handleTimeClick = (time, index) => {
    setCurrentAlarmTime(time);
    setCurrentAlarmIndex(index);
    setIsOpenTime(!isOpenTime);
  };

  const handleChangeAlarm = (time) => {
    if (currentAlarmIndex === null || currentAlarmIndex === undefined) {
      const uuid = nanoid();

      setDataAlarm([
        ...dataAlarm,
        { id: uuid, time: time, selectedDays: [], isActive: true },
      ]);

      notifications.schedule(uuid, moment(time).format("HH"), moment(time).format("mm"))
    } else {
      setDataAlarm(
        dataAlarm.map((item, index) => {
          if (index === currentAlarmIndex) item.time = time;
          return item;
        })
      );
    }
    setIsOpenTime(false);
  };

  const showDeleteModal = (index) => {
    setIsShowDeleteModal(!isShowDeleteModal);
    setIndexDataDeleted(index)
  }

  const handleDeleteAlarm = () => {
    let listAlarm = [...dataAlarm];
    listAlarm.splice(indexDataDeleted, 1);
    setDataAlarm(listAlarm);
    showDeleteModal(null)
  };

  const handleCancelAlarm = () => {
    setIsOpenTime(false);
  };

  const handleActivateAlarm = (indexAlarm) => {
    setDataAlarm(
      dataAlarm.map((item, index) => {
        if (index === indexAlarm) item.isActive = !item.isActive;
        return item;
      })
    );
  };

  const getDayLabel = (time, selectedDays) => {
    const currentDate = new Date();
    const alarmTime = new Date();
    const [hours, minutes] = moment(time).format("HH:mm")?.split(":");
    alarmTime.setHours(hours);
    alarmTime.setMinutes(minutes);

    if (!selectedDays?.length) {
      return alarmTime > currentDate ? "Today" : "Tomorrow";
    } else if (selectedDays?.length === 7) {
      return "Everyday";
    } else {
      return selectedDays?.join(", ");
    }
  };

  return (
    <>
      <VStack w="100%" mb="5rem" mt="3">
        {dataAlarm?.map((item, index) => (
          <Box
            key={item.id}
            w="100%"
            bg={colorMode === "light" ? 'white' : 'mutedBase.light'}
            pt="2"
            pb="4"
            px="4"
            my="1"
            borderRadius="12px"
            sx={{ boxShadow: '0px 8px 20px -4px #1C37BE1A' }}
            onClick={(e) => handleCollapseAlarm(e, index)}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <VStack alignItems="start" gap="0">
                <Text
                  fontSize="2rem"
                  textStyle="semi"
                  onClick={stopPropagation(() => handleTimeClick(item.time, index))}
                >
                  {moment(item?.time)?.format("HH:mm")}
                </Text>
                <Text textStyle="xsmall">
                  {getDayLabel(item?.time, item?.selectedDays)}
                </Text>
              </VStack>
              <Switch
                id="alarm-activated"
                mt="2"
                isChecked={item.isActive}
                onChange={stopPropagation(() => handleActivateAlarm(index))}
              />
            </HStack>
            <Collapse in={collapsedIndex === index} animateOpacity>
              <HStack justify="space-between" alignItems="center" my="4">
                <HStack spacing={2}>
                  {days.map((day) => (
                    <Button
                      key={day.value}
                      variant={
                        item?.selectedDays?.includes(day.value)
                          ? "solidPrimary"
                          : "outlinePrimary"
                      }
                      borderRadius="100%"
                      w="30px"
                      minW="30px"
                      h="30px"
                      px="0"
                      fontSize="14px"
                      onClick={stopPropagation(() => handleClickDay(day, index))}
                    >
                      {day.label}
                    </Button>
                  ))}
                </HStack>
              </HStack>
              <HStack alignItems="center" my="3">
                <Image src={icons.label} w="1em" h="1em" />
                <Input
                  placeholder="Add Label"
                  variant="unstyled"
                  fontSize="0.85rem"
                  value={item?.label}
                  onChange={stopPropagation((e) => handleChangeLabel(e?.target?.value, index))}
                />
              </HStack>
              <HStack
                alignItems="center"
                my="3"
                onClick={stopPropagation(() => showDeleteModal(index))}
              >
                <Image src={icons.delete} w="1em" h="1em" />
                <Text fontSize="0.85rem">Delete</Text>
              </HStack>
            </Collapse>
          </Box>
        ))}
      </VStack>
      <HStack
        justifyContent="center"
        bottom="70px"
        position="fixed"
        zIndex="99"
      >
        <Button
          variant={useColorModeValue('primary.light', 'primary.dark')}
          rounded="full"
          w="60px"
          h="60px"
          fontSize="30px"
          onClick={() => {
            setCurrentAlarmIndex(null);
            setCurrentAlarmTime(null);
            setIsOpenTime(!isOpenTime);
          }}
        >
          +
        </Button>
      </HStack>
      {isOpenTime && (
        <TimePicker
          value={currentAlarmTime ? new Date(currentAlarmTime) : null}
          handleChange={handleChangeAlarm}
          toggle={handleCancelAlarm}
        />
      )}
      <ConfirmationModal
        isOpen={isShowDeleteModal} 
        toggle={() => showDeleteModal(null)} 
        confirm={handleDeleteAlarm} 
        message="Are you sure you want to delete this alarm?"
        titleConfirm="Delete"
      />
    </>
  );
};

export default Index;
