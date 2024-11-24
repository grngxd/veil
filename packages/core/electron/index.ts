let iframe: HTMLIFrameElement;

const handleStorage = () => {
    iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.documentElement.append(iframe);

    const { localStorage, sessionStorage } = iframe.contentWindow as Window;
    
    return [
        localStorage,
        sessionStorage
    ];   
}

const unloadStorage = () => {
    iframe.remove();
}

const [localStorage, sessionStorage] = handleStorage();

export {
    handleStorage, localStorage,
    sessionStorage, unloadStorage
};

