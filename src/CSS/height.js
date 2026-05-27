import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CustomSlider from '../UI-Models/CustomSlider';
import NumberInput from '../UI-Models/NumberInput';
const Height = ({ element }) => {
    return (_jsxs("div", { children: ["height:", _jsx(CustomSlider, { element: element }), _jsx(NumberInput, {})] }));
};
export default Height;
