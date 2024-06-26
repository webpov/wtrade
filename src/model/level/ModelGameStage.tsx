"use client"
import { Box, GizmoHelper, GizmoViewcube, MapControls, OrbitControls, Plane } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import WormHoleModel from "@/model/parts/WormHoleModel";
import { Fog } from "three";
import { LoadingFullScreen } from "@/model/tools/LoadingFullScreen";
import useSyncedKLines from "@/../script/util/hook/useSyncedKLines";
import { useUrlParamCatcher } from "@/../script/util/hook/useUrlParamCatcher";
import { BoxCandleKLine } from '@/model/tools/charts/BoxCandleKLine'
import { BoxCandleKLineGuideLines } from '@/model/tools/charts/BoxCandleKLineGuideLines'
import HistoryLogs from "../tools/charts/HistoryLogs";
import { RelativeBoundaryLines } from "./RelativeBoundaryLines";


export default function ModelGameStage({config, state, calls,  children}:{config:any,state:any, calls:any, children:ReactNode}) {
  const $ltfChart:any = useRef()
  const $htfChart:any = useRef()
  const searchParams = useSearchParams()
  const urlp = useUrlParamCatcher()
  const isDOF = searchParams.has('dof')
  const noAutoRotate = searchParams.has('norotate') || true
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const [mounted, s__Mounted] = useState(false);

  function getFirstDayOfCurrentQuarterUnix() {
    var now = new Date();
    var currentQuarter = Math.floor((now.getMonth() / 3));
    var firstDayOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
    return Math.floor(firstDayOfQuarter.getTime() );
}

function getFirstDayOfNextQuarterUnix() {
  var now = new Date();
  var currentQuarter = Math.floor((now.getMonth() / 3));
  var nextQuarterFirstMonth = (currentQuarter + 1) * 3;
  
  // Handle the case where the next quarter is in the next year
  var year = now.getFullYear();
  if (nextQuarterFirstMonth === 12) {
      nextQuarterFirstMonth = 0; // January of next year
      year++;
  }
  
  var firstDayOfNextQuarter = new Date(year, nextQuarterFirstMonth, 1);
  return Math.floor(firstDayOfNextQuarter.getTime() );
}

  useEffect(()=>{
    const theUnixReference = getFirstDayOfCurrentQuarterUnix()
    const theUnixCutoff = getFirstDayOfNextQuarterUnix()
    // console.log("getFirstDayOfCurrentQuarterUnix", theUnixReference, theUnixCutoff)

    const currentUnix = Date.now()
    const unixLeft = theUnixCutoff - currentUnix
    const daysLeft = Math.floor(unixLeft/1000/60/60/24)
    // console.log("unixLeft", daysLeft, unixLeft, !!$htfChart.current)

    if (!$htfChart.current) {
      setTimeout(()=>{
        if ($htfChart.current) {
          $htfChart.current.position.x = -0.02*(daysLeft)
        }
      },500)
      return
    }

    $htfChart.current.position.x = -0.02*(daysLeft)

  },[$htfChart.current, state.ltfClosingList, state.activeMobileTab, state.focusSymbol])

  const CHOP_AMOUNT = 400
  const lastOfLTF = useMemo(()=>{
    
    return [...state.ltfClosingList] // .slice(-CHOP_AMOUNT) 
  },[state.ltfClosingList])
  const lastOfHTF = useMemo(()=>{
    
    return [...state.htfClosingList] // .slice(-CHOP_AMOUNT) 
  },[state.htfClosingList])


  const selectedFav: any = useMemo(() => {
    if (!state.favs) return null;
    if (!state.favs.length) return null;
    const selectedSymbolData = state.favs.filter((item: any) => {
      return item.symbol == state.focusSymbol;
    });
    // console.log("selectedFav", selectedSymbolData)  
    return selectedSymbolData[0];
  }, [state.favs, state.focusSymbol,]);
  
  const semiFixedViewConfig = {
    
    minAzimuthAngle:0,
    maxAzimuthAngle:0,
    minPolarAngle:0.5,
    maxPolarAngle:0.88,
  }
  const htf_latestUnix = useMemo(()=>{
    if (!state.htfList) return 1
    if (!state.htfList[499]) return 1
    return state.htfList[499][0]
  },[state.htfList])
  const htf_oldestUnix = useMemo(()=>{
    if (!state.htfList) return 1
    if (!state.htfList[0]) return 1
    return state.htfList[0][0]
  },[state.htfList])

  const ltf_minValue = useMemo(() => {
    if (!state.ltfList || state.ltfList.length === 0) return null;
    const returnValue = Math.min(...state.ltfList.map((item:any) => item[2]));
    // console.log("returnValue", returnValue)
    return returnValue
  }, [state.ltfList]);  
  const ltf_maxValue = useMemo(() => {
    if (!state.ltfList || state.ltfList.length === 0) return null;
    const returnValue = Math.max(...state.ltfList.map((item:any) => item[4]));
    // console.log("returnValue", returnValue)
    return returnValue
  }, [state.ltfList]);
  
  const ltf_latestUnix = useMemo(() => {
    if (!state.ltfList || state.ltfList.length === 0) return 1;

    const extendedList = [...state.ltfList];
    while (extendedList.length < 500) {
      extendedList.unshift(extendedList[0])
    }

    return extendedList[499][0];
}, [state.ltfList]);
  
  const ltf_oldestUnix = useMemo(() => {
    if (!state.ltfList || state.ltfList.length === 0 || !state.ltfList[0]) return 1;
    return state.ltfList[0][0];
  }, [state.ltfList]);
  
  const selectedTradeLogs = useMemo(()=>{
    if (!state.tradeLogsObj) { return null }
    if (!state.focusSymbol) { return null }

    // console.log("state.tradeLogsObj[state.focusSymbol]", state.tradeLogsObj[state.focusSymbol])
    return state.tradeLogsObj[state.focusSymbol]
  },[state.tradeLogsObj, state.focusSymbol])
  const selectedCustomTradeLogs = useMemo(()=>{
    if (!state.customTradeList) { return null }
    if (!state.focusSymbol) { return null }

    // console.log("selectedCustomTradeLogs", state.customTradeList, state.focusSymbol)
    return state.customTradeList[state.focusSymbol]
  },[state.customTradeList, state.focusSymbol])
  useEffect(() => {
      s__Mounted(true);
  }, []);

  const deleteCube = (index:number) => {
    // state.customTradeList
    // console.log("state.customTradeList", state.customTradeList, state.focusSymbol, index)
    // console.log("state.customTradeList", state.customTradeList[state.focusSymbol])
    // console.log("state.customTradeList", state.LS_customTradeList[state.focusSymbol])
    const currentArray = state.LS_customTradeList[state.focusSymbol]
    const arrayWithoutIndex = currentArray.filter((item:any, i:number)=> i!== index)
    const newCustom = {...state.LS_customTradeList, [state.focusSymbol]: arrayWithoutIndex}
    // console.log("newCustom", newCustom)
    // const newFull = {...state.LS_customTradeList, [state.focusSymbol]: arrayWithoutIndex}
    calls.s__customTradeList(newCustom)
    calls.s__LS_customTradeList(newCustom)

    // calls.
    // s__LS_customTradeList,
    // s__customTradeList,

  }

  if (!mounted) return <LoadingFullScreen />;

  return (<>
    <div className={`flex-col h-100 tx-altfont-4 bg-b-10 box-shadow-i-9-b ${config.isChartMovable ? "" : "nopointer"}`}>
      <Canvas style={{maxWidth:"100vw",height:"100%"}} shadows 
        className={` ${config.isChartMovable ? "" : "nopointer"}`}
        camera={{fov:10,position:[0,isSmallDevice?30:25,isSmallDevice?30:25]}}
        gl={{ preserveDrawingBuffer: true, }}
        // onCreated={(state)=>{ state.gl.setClearColor("#101319"); state.scene.fog = new Fog("#101319",8,16) }}
      >
        {/* <OrbitControls  autoRotateSpeed={.25} autoRotate={!noAutoRotate} 
          enableDamping={false}
          // dampingFactor={.01} 
          maxPolarAngle={1.65} minPolarAngle={1.125}
          minAzimuthAngle={Math.PI/4}
          maxAzimuthAngle={Math.PI/4*3}
        /> */}
        <MapControls 
          enableDamping={false}
          enablePan={config.isChartMovable}
          enableZoom={config.isChartMovable}
          enableRotate={config.isChartMovable}
          rotateSpeed={0.1}

          minAzimuthAngle={!config.isChartMovable ? 0 : 0}
          maxAzimuthAngle={!config.isChartMovable ? 0 : 0}
          minPolarAngle={!config.isChartMovable ? Math.PI/4 : 0.5}
          maxPolarAngle={!config.isChartMovable ? Math.PI/4 : 1}

          // {...(config.isChartMovable ? semiFixedViewConfig : {})}
        />
        <ambientLight intensity={0.02} />
        <pointLight position={[2,-1.7,0]} intensity={2} distance={4} />
        {/* <pointLight position={[-1,1,-3]} intensity={0.05} /> */}
        {config.isGizmoVisible &&
          <group>
            <GizmoHelper   alignment="bottom-left" margin={[50, 50]} >
            <GizmoViewcube
              
              color="gray"
              
              strokeColor="white"
              textColor="black"
              
              hoverColor="#999"
              opacity={1}
              
            />
          </GizmoHelper>
        </group>
        }

      
        <group rotation={[-Math.PI/4,0,0]}>
          <group position={[-0.75,0,0]} >
          
            {/* <Box > <meshStandardMaterial color="white" /> </Box> */}
            <group position={[0,-2, 0]} > <WormHoleModel /> </group>



            <group ref={$ltfChart}>    
              {!state.isChartLoading && 
                <group position={[2,-0.7 ,0]}>
                  <BoxCandleKLine cubeSize={.025} closingContextPrices={lastOfLTF} 
                    yRange={[0,3.6]}
                    // chopStart={500-CHOP_AMOUNT}
                    chopStart={0}
                    fullArray={state.ltfList} 
                  />
                            
                  {/* <Box args={[7, 0.02, 0.02]} position={[-3, 2.35, 0]}>
                    <meshStandardMaterial color="white" emissive={"#555"} />
                  </Box> */}




                  
{!!selectedFav && 
                    <group  position={[-0.025*50,0,0]} >
                    <BoxCandleKLineGuideLines cubeSize={.025} closingContextPrices={lastOfLTF} 
                    yRange={[0,3.6]}
                      // chopStart={500-CHOP_AMOUNT}
                      chopStart={0}
                      fullArray={[
                        [0,parseFloat(selectedFav.floor),parseFloat(selectedFav.floor),
                          parseFloat(selectedFav.floor),parseFloat(selectedFav.floor)*1.001,
                          0,0
                        ],
                        [0,parseFloat(selectedFav.roof),parseFloat(selectedFav.roof),
                          parseFloat(selectedFav.roof),parseFloat(selectedFav.roof)*0.999,
                          0,0
                        ],
                        [0,parseFloat(selectedFav.target),parseFloat(selectedFav.target),
                          parseFloat(selectedFav.target),parseFloat(selectedFav.target)*0.999,
                          0,0
                        ],
                      ]} 
                      state={{
                        symbol: state.focusSymbol,
                        // yRange:[0,2.15],
                        favs: state.favs,
                        summaryDetails: state.selectedSymbolYTDSummary,
                        }}
                    />
                    </group>}
                  
                  

                    {!!selectedCustomTradeLogs && state.selectedSymbolYTDSummary&& <>
                    <group rotation={[0,-Math.PI/2,0]} position={[-0.05,0.05,1]} scale={[1,3.5,12.25]}>  {/* 1.97 */}
                      <HistoryLogs
                      deleteCube={deleteCube}
                      customSizeRatio={state.logSphereSize}
                          customChildren={true}

                        calls={{refetchLogs:()=>{}}}
                        state={{orderLogs: selectedCustomTradeLogs, }}
                        minValue={ltf_minValue}
                        maxValue={ltf_maxValue}
                        latestUnix={ltf_latestUnix} oldestUnix={ltf_oldestUnix}
                      />
                    </group>
                  </>}
                  
                  
                  
                  
                  
                  
                  {/* <group position={[0,-4.8,0]}>
                    <RelativeBoundaryLines state={{
                      symbol: state.focusSymbol,
                      yRange:[0,8.1],
                      favs: state.favs,
                      summaryDetails: state.selectedSymbolYTDSummary,
                      }}
                    />
                </group> */}
                </group>
                }
              </group>


              <Plane args={[0.02*90,2,3]} position={[1.09,-2,0]}>
                  <meshStandardMaterial wireframe={true} emissive="#420" />
                </Plane>   

              <group ref={$htfChart}> 
                {/* <Box args={[0.02*83,1.8,0.01]} position={[1.16,-2,0]}>
                  <meshStandardMaterial wireframe={true} emissive="#444" />
                </Box>    */}
                <Plane args={[0.02*83/3,1.8]} position={[1.16+(0.02*83/3),-2,-0.1]}>
                  <meshStandardMaterial color="#fff" wireframe={true} emissive={"#555"} />
                </Plane>   

                {!state.isChartLoading && 
                  <group position={[2,-2.9 ,0]}>
                    <BoxCandleKLine cubeSize={.02} closingContextPrices={lastOfHTF} 
                      yRange={[0,1.8]}
                      // chopStart={500-CHOP_AMOUNT}
                      chopStart={0}
                      fullArray={state.htfList} 
                    />
                    {!!selectedFav && 
                    <group /* position={[0.02*450,0,0]} */>
                    <BoxCandleKLineGuideLines cubeSize={.02} closingContextPrices={lastOfHTF} 
                      yRange={[0,1.8]}
                      // chopStart={500-CHOP_AMOUNT}
                      chopStart={0}
                      fullArray={[
                        [0,parseFloat(selectedFav.floor),parseFloat(selectedFav.floor),
                          parseFloat(selectedFav.floor),parseFloat(selectedFav.floor)*1.001,
                          0,0
                        ],
                        [0,parseFloat(selectedFav.roof),parseFloat(selectedFav.roof),
                          parseFloat(selectedFav.roof),parseFloat(selectedFav.roof)*0.999,
                          0,0
                        ],
                        [0,parseFloat(selectedFav.target),parseFloat(selectedFav.target),
                          parseFloat(selectedFav.target),parseFloat(selectedFav.target)*0.999,
                          0,0
                        ],
                      ]} 
                      state={{
                        symbol: state.focusSymbol,
                        // yRange:[0,2.15],
                        favs: state.favs,
                        summaryDetails: state.selectedSymbolYTDSummary,
                        }}
                    />
                    </group>}
                    {/* <group position={[0,-0.38,0]}>
                    <RelativeBoundaryLines state={{
                      symbol: state.focusSymbol,
                      yRange:[0,2.15],
                      favs: state.favs,
                      summaryDetails: state.selectedSymbolYTDSummary,
                      }}
                    />
                    </group> */}

                    {!!selectedTradeLogs && state.selectedSymbolYTDSummary && <>
                      <group rotation={[0,-Math.PI/2,0]} position={[-0.05,0.05,1]} scale={[1,1.7,9.8]}>  {/* 1.97 */}
                        <HistoryLogs
                          calls={{refetchLogs:()=>{}}}
                          state={{orderLogs: selectedTradeLogs, }}
                          minValue={state.selectedSymbolYTDSummary.minValue}
                          maxValue={state.selectedSymbolYTDSummary.maxValue}
                          latestUnix={htf_latestUnix} oldestUnix={htf_oldestUnix}
                        />
                      </group>
                    </>}

                  {!!selectedCustomTradeLogs && state.selectedSymbolYTDSummary&& <>
                    <group rotation={[0,-Math.PI/2,0]} position={[-0.05,0.05,1]} scale={[1,1.7,9.8]}>  {/* 1.97 */}
                      <HistoryLogs

                        calls={{refetchLogs:()=>{}}}
                        state={{orderLogs: selectedCustomTradeLogs, }}
                        minValue={state.selectedSymbolYTDSummary.minValue}
                        maxValue={state.selectedSymbolYTDSummary.maxValue}
                        latestUnix={htf_latestUnix} oldestUnix={htf_oldestUnix}
                      />
                    </group>
                  </>}
                </group>
                }
            </group>    
          </group>    
        </group>
      </Canvas>
    </div>
  </>)
}


