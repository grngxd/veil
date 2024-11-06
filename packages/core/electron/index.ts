const handleStorage = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.documentElement.append(iframe);

    const { localStorage, sessionStorage } = iframe.contentWindow as Window;

    setTimeout(() => {
        iframe.remove();
    }, 0);
    
    return [
        localStorage,
        sessionStorage
    ];   
}

const [localStorage, sessionStorage] = handleStorage();

export {
    handleStorage,
    localStorage,
    sessionStorage
};

