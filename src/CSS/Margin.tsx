import React from 'react'
import CustomSlider from '../UI-Models/CustomSlider'
import NumberInput from '../UI-Models/NumberInput'
interface ChildProps {
    element: HTMLElement | null;
  }
const Margin : React.FC<ChildProps> = ({ element }) =>  {

    return (
   
        <div>
            Margin:
            <CustomSlider max={200} step={1} element={element} onChange={(val)=>{
                if (element) {
                  element.style.margin = `${val}px`; 
                }
            }} />
           <div style={{display:'flex', gap:'10px'}}>
           <NumberInput  onChange={(val)=>{
                if (element) {
                  element.style.marginTop = `${val}px`; 
                }
            }} />
            <NumberInput onChange={(val)=>{
                if (element) {
                  element.style.marginLeft = `${val}px`; 
                }
            }} />
            <NumberInput  onChange={(val)=>{
                if (element) {
                  element.style.marginBottom = `${val}px`; 
                }
            }}/>
            <NumberInput onChange={(val)=>{
                if (element) {
                  element.style.marginRight = `${val}px`; 
                }
            }} />
           </div>





        </div>
  )
}

export default Margin