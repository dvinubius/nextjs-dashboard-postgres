import { SpinnerCircular } from 'spinners-react';

export default function Loading() {
  return <div className="flex flex-grow justify-center h-full">
      <SpinnerCircular color='black'/>
    </div>
}