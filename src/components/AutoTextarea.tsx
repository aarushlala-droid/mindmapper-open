import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';
export function AutoTextarea(props:TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref=useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(()=>{const el=ref.current;if(el){el.style.height='0px';el.style.height=`${el.scrollHeight}px`;el.scrollTop=0;}},[props.value]);
  return <textarea {...props} ref={ref} style={{...props.style,overflow:'hidden',resize:'none',maxHeight:'none'}}/>;
}
