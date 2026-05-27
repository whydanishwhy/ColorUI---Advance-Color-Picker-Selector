import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CustomSlider from '../UI-Models/CustomSlider';
import NumberInput from '../UI-Models/NumberInput';
const Margin = ({ element }) => {
    return (_jsxs("div", { children: ["Margin:", _jsx(CustomSlider, { max: 200, step: 1, element: element, onChange: (val) => {
                    if (element) {
                        element.style.margin = `${val}px`;
                    }
                } }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx(NumberInput, { onChange: (val) => {
                            if (element) {
                                element.style.marginTop = `${val}px`;
                            }
                        } }), _jsx(NumberInput, { onChange: (val) => {
                            if (element) {
                                element.style.marginLeft = `${val}px`;
                            }
                        } }), _jsx(NumberInput, { onChange: (val) => {
                            if (element) {
                                element.style.marginBottom = `${val}px`;
                            }
                        } }), _jsx(NumberInput, { onChange: (val) => {
                            if (element) {
                                element.style.marginRight = `${val}px`;
                            }
                        } })] })] }));
};
export default Margin;
