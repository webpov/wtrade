"use client";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import crypto from "crypto";
import { computeHash } from '@/../script/util/webhelp'
import { useMap, MapOrEntries, useMediaQuery, useCopyToClipboard } from 'usehooks-ts';
import { updatePublicSecretKey } from "../../../script/state/service/local";

export function FavSymbols({ state, calls }: any) {
  const [hydrationSafeLoad, s__hydrationSafeLoad] = useState(0);
  const [livePassword, s__livePassword] = useState("");
  const pathname = usePathname()
  const [clipbloardValue, clipbloard__do] = useCopyToClipboard()


    const triggerClearFavs =()=>{
      calls.s__LS_favs([])
    }
  useEffect(() => {
    s__hydrationSafeLoad(hydrationSafeLoad + 1);
  }, []);
  const triggerExportAsUrl = () => {
    let returnString = ""
    state.LS_favs.map((item:any)=>{
      returnString += `&${item.posCode}=${JSON.stringify({symbol:item.symbol})}`
    })
    let baseUrl = window.location.href.split("?")[0]
    returnString = `${baseUrl}?${returnString.substring(1)}`
    clipbloard__do(returnString)
    prompt("Export as URL", returnString)
  }


  const triggerSetKeys = () => {
    let publicKey = prompt("Enter public key", "")
    if (!publicKey) { return }
    let secretKey = prompt("Enter secret key", "")
    if (!secretKey) { return }
    let personalCodeKey = prompt("Enter password", "")
    if (!personalCodeKey) { return }
    let wHash = computeHash(`${publicKey}:${secretKey}`, crypto.createHash)
    
  }

  const trigger__publicSecretKeys= (e:any) => {
    // console.log("e", e.target.value)
    calls.s__LS_publicSecretKeys(e.target.value)
  }
  const trigger__livePassword= (e:any) => {
    // console.log("e", e.target.value)
    s__livePassword(e.target.value)
  }
  const triggerSaveKeys= async (e:any) => {
    // console.log("eeeeeeeeeeeeeeeeeeeeeeeee")
    if (!state.LS_publicSecretKeys) { return }
    // console.log("hhhhhhhhhhhhhhhh")
    if (!livePassword) { return }
    // console.log("uuuuuuuuuuuuu")

    const theHash = ""
    let wHash:string = computeHash(state.LS_publicSecretKeys, livePassword, crypto.createHash)
    s__livePassword("")
    // console.log("wHash", wHash)
    calls.s__LS_publicSecretKeys(wHash)
    const keysRes = await updatePublicSecretKey(wHash, state.LS_publicSecretKeys)
  }

  const triggerChangeSymbol = (aSymbol:string) => {
    calls.s__isChartLoading(true)
    calls.s__focusSymbol(aSymbol)
  }
  const isLogsFilled = (aSymbol:string) => {
    if (!state.tradeLogsObj) { return null }

    return !!state.tradeLogsObj[aSymbol]
  }

  const selectedTradeLogs = useMemo(()=>{
    if (!state.tradeLogsObj) { return null }
    if (!state.focusSymbol) { return null }

    return state.tradeLogsObj[state.focusSymbol]
  },[state.tradeLogsObj, state.focusSymbol])

  if (!hydrationSafeLoad) {
    return (<></>);
  }
  return (<>
    <div className=" w-90  flex-col gap-1" >
      {!!state.LS_favs.length &&
        <button className={`tx-white ${"tx-mdl"} opaci-chov--50 bg-w-10 bord-r-25 pa-2 mb-2 translate-y--50`}
          onClick={triggerExportAsUrl}
        >
          Export as URL
        </button>
      }
      {state.LS_favs.map((item: any, index: number) => {
        return (<div key={index} className=" w-100">
          <div className="  flex-col flex-align-stretch  bord-r-10  w-100 noborder tx-white "
            style={{ 
              background: "linear-gradient(45deg, #ffffff03, #ffffff11",
              
            }}
            

          >
            <div className="tx-bold-9 px-2 flex  flex-justify-between gap-3">
                {!!isLogsFilled(item.symbol) &&  <>
                  <button className="tx-center  tx-lgx tx-green noborder bg-trans "
                    // onClick={()=>{calls.triggerGetLogs()}}
                  >
                    |
                  </button>
                </>}
              {/* <div className="tx-md tx-altfont-1">{index + 1}</div> */}
              <div className="flex-1 tx-mdl py-1 my-2 tx-ls-2 tx-start bg-w-10 bord-r-25 pl-4 opaci-chov--50 underline" title={item.symbol}
                onClick={()=>{triggerChangeSymbol(item.symbol)}}
                style={{
                  ...(state.focusSymbol == item.symbol ? {borderLeft:"3px solid white", background: "linear-gradient(-90deg, #ffffff44, #ffffff11)"} : {})
                }}
              >
                {item.token0}
              </div>
              <div className="tx-roman tx-mdl flex-col">{!!item.floor && <>
                {item.floor}
              </>}</div>
              <div className="flex-col">-</div>
              <div className="tx-roman tx-mdl flex-col">{!!item.roof && <>
                {item.roof}
              </>}</div>
              <div className="flex-col">
                {!!state.isFetchingLogs && <>
                  <button className={`tx-center  spin-${index+2}`}>
                    ...
                  </button>
                </>}
                {!state.isFetchingLogs && <>
                  <button className={`bord-r-10 tx-center opaci-chov--50 ${!!isLogsFilled(item.symbol) ? "border-green" : ""}` }
                    onClick={()=>{calls.triggerGetLogs(item.symbol)}}
                  >
                    Logs
                  </button>
                </>}
                
              </div>
            </div>
          </div>
        </div>);
      })}
      {!!state.LS_favs.length &&
        <button className={`tx-white ${"tx-lgx"} opaci-chov--50 bg-w-10 bord-r-25 pa-2 mt-2`}
          onClick={triggerClearFavs}
        >
          Clear
        </button>
      }
      {!state.LS_favs.length &&
        <div className={`tx-white ${"tx-lgx"} opaci-50 tx-lx bg-w-10 bord-r-25 pa-2 mt-2 tx-center`}
          // onClick={triggerClearFavs}
        >
          Not Found
        </div>
      }
      <details className="w-100  flex-col flex-justify-center pos-rel flex-align-center pb-8 pos-rel">
        <summary className="flex-col opaci-chov--50">
          <hr className="w-90 mt-8" />
          <button className="flex-col bg-trans noborder tx-white tx-mdl py-3 noclick">
            Account Keys
          </button>
        </summary>
        <div className="pos-abs z-500 bottom-50p">
          <div className="flex-wrap flex-justify-center box-shadow-9-t mb-8 gap-2 w-100 flex-align-center    bg-b-90 bord-r-25 py-6 bg-glass-5">
            <div className="flex-center w-100 ">
              <input className="bord-r-25 px-3 py-1 bg-w-10 w-100 tx-white tx-center"
                onChange={trigger__publicSecretKeys}
                value={state.LS_publicSecretKeys}
                placeholder="Public:Secret" type="text" 
              />
            </div>
            <div className="flex-center w-80">
              <input className="bord-r-25 px-3 py-1 bg-w-10 w-100 tx-mdl tx-white tx-center"
                onChange={trigger__livePassword}
                value={livePassword}
                placeholder="Password" type="text" 
              />
            </div>
            <div className="w-100 flex-center">
              <button className="tx-lg px-3 py-1 bord-r-10 mt-1 opaci-chov--50"
                onClick={triggerSaveKeys}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </details>
    </div>
  </>);
}
