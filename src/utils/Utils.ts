


export interface SearchValueMatch {
    name: string;
    value: string;
}

export class Utils {

    /**
     * To search a data by regexp inside an object at a configurable depth
     *
     * Return all matching values with access path as a string
     *
     * @param pObject
     * @param pAccessPath
     * @param pBlacklist
     * @param tab
     */
    static searchValue(pRegexp:RegExp, pObject: any, pAccessPath: string,
                       pBlacklist:string[], pMaxDepth:number, pMatches: SearchValueMatch[], pCurrDepth:number = 0):void {

        let basePath:string;

        if (typeof pObject === 'object'
            && (pMaxDepth==-1 || pCurrDepth <= pMaxDepth)) {

            basePath = ( pAccessPath != null ? pAccessPath+"." : "" );

            Object.keys(pObject).forEach((vKey) => {
                if (pBlacklist.indexOf(basePath + vKey) == -1)
                    Utils.searchValue(
                        pRegexp,
                        pObject[vKey],
                        basePath + vKey,
                        pBlacklist,
                        pMaxDepth,
                        pMatches,
                        pCurrDepth+1);
            });
        }
        else if (pRegexp.test(pObject)){
            pMatches.push({ name: pAccessPath, value: pObject });
        }
    }



    /**
     * To search a data by regexp inside an object at a configurable depth
     *
     * Return all matching values with access path as a string
     *
     * @param pObject
     * @param pAccessPath
     * @param pBlacklist
     * @param tab
     */
    static readValue(pObject: any, pAccessPath: string):any {


        const levels = pAccessPath.split('.');
        let node = pObject;

        for(let i=0; i<levels.length; i++){
            if((typeof (node) === 'object') && (node !== null) && (node !==undefined)){
                if(node.hasOwnProperty(levels[i])){
                    node = node[levels[i]];
                }else{
                    return null;
                }
            }else{
                return null;
            }
        }

        return node;
    }


    /**
     * To search a data by regexp inside an object at a configurable depth
     *
     * Return all matching values with access path as a string
     *
     * @param pObject
     * @param pAccessPath
     * @param pBlacklist
     * @param tab
     */
    static walkOver(pObject: any, pCallback:any, pAccessPath: string,
                    pBlacklist:string[], pMaxDepth:number,  pCurrDepth:number = 0):any {

        let basePath:string;

        if (typeof pObject === 'object'
            && (pMaxDepth==-1 || pCurrDepth <= pMaxDepth)) {

            basePath = ( pAccessPath != null ? pAccessPath+"." : "" );

            Object.keys(pObject).forEach((vKey) => {
                if (pBlacklist.indexOf(basePath + vKey) == -1)
                    Utils.walkOver(
                        pObject[vKey],
                        pCallback,
                        basePath + vKey,
                        pBlacklist,
                        pMaxDepth,
                        pCurrDepth+1);
            });
        }
        else{
            pCallback.bind(pObject);
        }
    }
}