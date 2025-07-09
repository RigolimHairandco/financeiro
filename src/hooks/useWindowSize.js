import { useState, useEffect } from 'react';

export function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        
        window.addEventListener("resize", handleResize);
        
        // Chama o handler logo no início para pegar o tamanho inicial
        handleResize();
        
        // Remove o event listener ao desmontar o componente
        return () => window.removeEventListener("resize", handleResize);
    }, []); 

    return windowSize;
}
