import { useEffect, useState } from 'react';
import { SelectInput } from '../../atoms/SelectInput';
import { TopicT, selectSmallObjectT, userDataT } from '../../types';
import { useSelectInput } from '../../hooks/useSelectInput';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { User } from 'firebase/auth';

// --- Subcomponents ---

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <div className='flex items-center justify-between mb-6'>
    <h3 className='w-full text-2xl font-semibold text-center text-gray-900 dark:text-white'>
      Schedule Lesson
    </h3>
    <button
      type='button'
      className='absolute text-gray-400 top-4 right-4 hover:text-gray-900 dark:hover:text-white'
      onClick={onClose}
    >
      <span className='sr-only'>Close modal</span>
      <svg className='w-5 h-5' fill='none' viewBox='0 0 20 20'>
        <path
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M6 6l8 8M6 14L14 6'
        />
      </svg>
    </button>
  </div>
);

const SelectRow = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: any;
  options: { id: string | number; label: string }[];
}) => (
  <div>
    <label className='block mb-1 text-white'>{label}</label>
    <SelectInput value={value} onChange={onChange} options={options} />
  </div>
);

const ModalFooter = ({
  isValid,
  isValidReason,
  onAccept,
  onDecline,
}: {
  isValid: boolean;
  isValidReason: string;
  onAccept: () => void;
  onDecline: () => void;
}) => {
  console.log('isValid: ', isValid);
  return (
    <div>
      {!isValid && (
        <span className='text-lg text-red-500'>{isValidReason}</span>
      )}
      <div className='flex justify-end gap-4 mt-8'>
        <button
          type='button'
          disabled={!isValid}
          className={`px-6 py-2 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700 ${
            !isValid && 'cursor-not-allowed'
          }`}
          onClick={onAccept}
        >
          I accept
        </button>
        <button
          type='button'
          className='px-6 py-2 text-gray-700 transition bg-gray-200 rounded-lg shadow hover:bg-gray-300'
          onClick={onDecline}
        >
          Decline
        </button>
      </div>
    </div>
  );
};

// --- Main Modal ---

type CalendarAddLessonModalProps = {
  isOn: boolean;
  setIsOn: (v: boolean) => void;
  topicsArr: TopicT[];
  defaultDate: Date;
  selectObjects: {
    hoursObj: selectSmallObjectT;
    daysObj: selectSmallObjectT;
    monthsObj: selectSmallObjectT;
  };
  user: User;
  userData: userDataT;
  setDefaultBlockDate: (date: Date) => void;
};

export const CalendarAddLessonModal = ({
  isOn,
  setIsOn,
  topicsArr,
  defaultDate,
  selectObjects,
  user,
  userData,
}: CalendarAddLessonModalProps) => {
  const [selectedTopicId, setSelectedTopicId] = useState(
    topicsArr[0]?.id || ''
  );
  const yearsArr = [
    { id: 2025, label: '2025' },
    { id: 2026, label: '2026' },
  ];
  const { value: selectedYear, handleChange: handleYearChange } =
    useSelectInput(defaultDate.getFullYear(), yearsArr);
  const { value: selectedMonth, handleChange: handleMonthChange } =
    useSelectInput(
      defaultDate.getMonth(), // Use month (1-12) for default
      selectObjects.monthsObj.options
    );

  const { value: selectedDay, handleChange: handleDayChange } = useSelectInput(
    defaultDate.getDate(), // Use day of month for default
    selectObjects.daysObj.options
  );

  const { value: selectedHour, handleChange: handleHourChange } =
    useSelectInput(defaultDate.getHours(), selectObjects.hoursObj.options);
  const minutesArr = [0, 30].map((x) => ({ id: x, label: x.toString() }));
  const { value: selectedMinutes, handleChange: handleMinuteChange } =
    useSelectInput(defaultDate.getMinutes(), minutesArr);
  // console.log('defaultDate in modal: ', defaultDate);
  const userClasses = userData.classes;

  const handleClose = () => setIsOn(false);
  const handleAccept = async () => {
    console.log('test');
    const docRef = doc(db, 'userData', user.uid);
    const buffer = selectedDate.getTime().toString();
    console.log('buffer.slice: ');
    await updateDoc(docRef, {
      tokens: increment(-1),
      used_tokens: increment(1),
      classes: arrayUnion({
        date: parseInt(buffer.slice(0, -3)),
        status: 'scheduled',
        topic: selectedTopicId,
      }),
    })
      .then(() => {
        console.log('Document successfully updated!');
      })
      .catch((error) => {
        console.error('Error updating document: ', error);
      });
    // alert(selectedDate.getTime());
    setIsOn(false);
  };
  const handleDecline = () => setIsOn(false);

  const selectedDate = new Date(
    Number(selectedYear),
    Number(selectedMonth),
    Number(selectedDay),
    Number(selectedHour),
    Number(selectedMinutes)
  );
  const [isValid, setIsValid] = useState(false);
  const [isValidReason, setIsValidReason] = useState('');

  useEffect(() => {
    // If userClasses is not loaded yet, just check tokens
    if (!userClasses) {
      setIsValid(userData.tokens > 0);
      setIsValidReason(userData.tokens > 0 ? '' : 'You have no tokens left');
      return;
    }

    const selectedTime = Math.floor(selectedDate.getTime() / 1000); // seconds
    const conflict = userData.classes.some((x) => {
      const diff = Math.abs(x.date - selectedTime);
      return diff < 3600; // less than 1 hour
    });

    if (conflict) {
      setIsValid(false);
      setIsValidReason('You have another lesson within 1 hour of this time');
    } else if (userData.tokens <= 0) {
      setIsValid(false);
      setIsValidReason('You have no tokens left');
    } else {
      setIsValid(true);
      setIsValidReason('');
    }
  }, [selectedDate, userClasses, userData.classes, userData.tokens]);
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${
        isOn ? '' : 'hidden'
      }`}
    >
      <div className='relative w-full max-w-lg p-8 bg-white shadow-lg dark:bg-black-pearl-950 rounded-xl'>
        <ModalHeader onClose={handleClose} />
        <div className='space-y-4'>
          <SelectRow
            label='Choose Topic'
            value={selectedTopicId}
            onChange={setSelectedTopicId}
            options={topicsArr.map((topic) => ({
              id: topic.id,
              label: topic.heading,
            }))}
          />
          <SelectRow
            label='Choose Year'
            value={selectedYear}
            onChange={handleYearChange}
            options={yearsArr}
          />
          <SelectRow
            label='Choose Month'
            value={selectedMonth}
            onChange={handleMonthChange}
            options={selectObjects.monthsObj.options}
          />
          <SelectRow
            label='Choose Day'
            value={selectedDay}
            onChange={handleDayChange}
            options={selectObjects.daysObj.options}
          />
          <SelectRow
            label='Choose Hour'
            value={selectedHour}
            onChange={handleHourChange}
            options={selectObjects.hoursObj.options}
          />
          <SelectRow
            label='Choose minutes'
            value={selectedMinutes}
            onChange={handleMinuteChange}
            options={minutesArr}
          />

          {/* <div className='text-lg text-white'>
            Selected time: {selectedDate.getTime().toString().slice(0, -3)}
          </div> */}
        </div>
        <ModalFooter
          isValid={isValid}
          isValidReason={isValidReason}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      </div>
    </div>
  );
};
