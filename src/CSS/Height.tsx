import React from 'react'
import CustomSlider from '../UI-Models/CustomSlider'
import NumberInput from '../UI-Models/NumberInput'
interface ChildProps {
    element: HTMLElement | null;
  }
const Height : React.FC<ChildProps> = ({ element }) =>  {

    return (
   
        <div>
            height:
            <CustomSlider max={1000} step={10} element={element} onChange={(val)=>{
                if (element) {
                  element.style.height = `${val}px`; 
                }
            }} />
            <NumberInput />
        </div>
  )
}

export default Height