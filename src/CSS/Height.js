import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CustomSlider from '../UI-Models/CustomSlider';
import NumberInput from '../UI-Models/NumberInput';
const Height = ({ element }) => {
    return (_jsxs("div", { children: ["height:", _jsx(CustomSlider, { max: 1000, step: 10, element: element, onChange: (val) => {
                    if (element) {
                        element.style.height = `${val}px`;
                    }
                } }), _jsx(NumberInput, {})] }));
};
export default Height;
