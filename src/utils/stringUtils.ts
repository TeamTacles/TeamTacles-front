export const getInitialsFromName = (name: string): string => {
    if (!name || !name.trim()) {
        return '';
    } 
    return name
        .trim() // tira espaços extras
    .split(' ') // dividie o nome em palabras
    .map(word => word.charAt(0)) // pega a primeira letra de cada palavra
    .join('') // junta as letras
    .toUpperCase(); //converte para maiúsculas
}

export const getInitialsFromArray = (namesString: string): string[] => {
    if (!namesString.trim()) { //embora o componente já trate isso, é uma boa prática verificar se a string não está vazia
        return [];
    }
    return namesString
        .split(',') // divide a string em nomes pela vírgula
        .map(name => getInitialsFromName(name));
};