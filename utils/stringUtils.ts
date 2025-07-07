/**
 * Extrai as iniciais de um único nome, separando as palavras por espaço.
 * Exemplo: "Caio Dib" se torna "CD".
 * @param name A string do nome.
 * @returns As iniciais em maiúsculo.
 */

const getInitialsFromName = (name: string): string => {
    if (!name.trim()) {
        return '';
    } 
    return name
        .trim() // tira espaços extras
    .split(' ') // dividie o nome em palabras
    .map(word => word.charAt(0)) // pega a primeira letra de cada palavra
    .join('') // junta as letras
    .toUpperCase(); //converte para maiúsculas

}

/**
 * Converte uma string de nomes separados por vírgula em um array de iniciais.
 * Exemplo: "Caio Dib, Gabriela Santana" se torna ['CD', 'GS']
 * @param namesString A string de nomes completos.
 * @returns Um array com as iniciais.
 */


export const getInitialsFromArray = (namesString: string): string[] => {
    if (!namesString.trim()) { //embora o componente já trate isso, é uma boa prática verificar se a string não está vazia
        return [];
    }
    return namesString
        .split(',') // divide a string em nomes pela vírgula
        .map(name => getInitialsFromName(name));
};
            
