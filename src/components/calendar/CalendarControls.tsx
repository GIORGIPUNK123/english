import leftArrowImg from '../../assets/left-arrow.svg';
import rightArrowImg from '../../assets/right-arrow.svg';
export const CalendarControls = (props: { setMonday: any }) => {
  const handleDateChange = (increment: number, setMonday: any) => {
    setMonday((prevState: Date) => {
      const newDate = new Date(prevState);
      newDate.setDate(newDate.getDate() + increment * 7);
      return newDate;
    });
  };
  return (
    <div className='buttons'>
      <button
        className='h-10 duration-150 bg-black bg-center bg-cover rounded-md w-14 invert hover:bg-stone-800'
        style={{ backgroundImage: `url(${leftArrowImg})` }}
        onClick={() => handleDateChange(-1, props.setMonday)}
      />
      <button
        className='h-10 duration-150 bg-black bg-center bg-cover rounded-md w-14 invert hover:bg-stone-800'
        style={{ backgroundImage: `url(${rightArrowImg})` }}
        onClick={() => handleDateChange(1, props.setMonday)}
      />
    </div>
  );
};
