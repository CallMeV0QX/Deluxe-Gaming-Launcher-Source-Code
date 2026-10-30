// ============================================================================
// DELUXE GAMING LAUNCHER - EXTRACTED APPLICATION MODULES & SCREENS
// ============================================================================

// --- [1] Socket.IO Client & Zustand Store Factory ---
:CE,io:Gu,connect:Gu
});
let zs=null;
const Az=()=>"https://api.deluxe-market.com/api".replace(/\/+$/,"").replace(/\/api$/,""),Oz=(e,t)=> {
  const n=Az(),s=localStorage.getItem("accessToken");
  if(zs) {
    if(zs.connected)return t&&zs.emit("join_user", {
      userId:t,token:s
    }),zs;
    zs.disconnect()
  }
  const i=`${n}/payments`;
  return zs=Gu(i, {
    autoConnect:!0,transports:["websocket","polling"],auth: {
      token:s
    },query: {
      userId:t?String(t):"",token:s||""
    }
    
  }),zs.on("connect",()=> {
    console.log("[Socket.IO] Connected to server:",zs?.id),t&&zs?.emit("join_user", {
      userId:t,token:s
    })
  }),zs.on("disconnect",l=> {
    console.log("[Socket.IO] Disconnected:",l)
  }),zs.on("connect_error",l=> {
    console.warn("[Socket.IO] Connection error:",l?.message)
  }),zs
}


// --- [2] Axios Client, Auth API, Auth Store & Payment Socket Provider ---
(t):e;
Be.info(n)
}

};
let ju=!1,My=[];
const uf=(e,t=null)=> {
  My.forEach(n=> {
    e?n.reject(e):n.resolve(t)
  }),My=[]
},eb=()=> {
  localStorage.removeItem("accessToken"),localStorage.removeItem("refreshToken"),localStorage.setItem(nd.AuthChanged,String(Date.now())),window.dispatchEvent(new CustomEvent("auth:logout"))
},hC=()=> {
  const t="https://api.deluxe-market.com/api".replace(/\/+$/,"");
  return t.endsWith("/api")?t:`${t}/api`
},mI=e=> {
  const t=Pn.create(e);
  return hI(t, {
    ttl:1e3
  }),t.interceptors.request.use(n=> {
    const s=localStorage.getItem("accessToken");
    return s&&(n.headers.Authorization=`Bearer ${s}`),n
  }),t.interceptors.response.use(n=>n,async n=> {
    const s=n.config;
    if(n.response?.status===401&&s&&!s._retry&&!s.url?.includes("/auth/login")&&!s.url?.includes("/auth/refresh-tokens")) {
      if(ju)return new Promise((d,f)=> {
        My.push( {
          resolve:d,reject:f
        })
      }).then(d=>(s._retry=!0,s.headers&&(s.headers.Authorization=`Bearer ${d}`),t(s))).catch(d=>Promise.reject(d));
      s._retry=!0,ju=!0;
      const l=localStorage.getItem("refreshToken");
      if(!l)return ju=!1,eb(),Promise.reject(n);
      const c=async()=> {
        try {
          const d=hC(),m=(await Pn.post(`${d}/auth/refresh-tokens`, {
            refreshToken:l
          })).data,p=m?.accessToken,g=m?.refreshToken;
          if(p)return localStorage.setItem("accessToken",p),g&&localStorage.setItem("refreshToken",g),s.headers&&(s.headers.Authorization=`Bearer ${p}`),uf(null,p),t(s);
          throw new Error("Refresh token returned invalid payload")
        }
        catch(d) {
          return uf(d,null),n.config?.silent||C2.error("UNAUTHORIZED"),eb(),Promise.reject(d)
        }
        finally {
          ju=!1
        }
        
      };
      return typeof navigator<"u"&&navigator.locks?navigator.locks.request("refresh_token_lock",async()=> {
        if(localStorage.getItem("refreshToken")!==l) {
          const f=localStorage.getItem("accessToken");
          return ju=!1,f?(s.headers&&(s.headers.Authorization=`Bearer ${f}`),uf(null,f),t(s)):(uf(n,null),eb(),Promise.reject(n))
        }
        return c()
      }):c()
    }
    return(async()=> {
      const l=n.response?.data;
      if(!n.config?.silent) {
        let c=l?.code,d=l?.message;
        if(!c&&l instanceof Blob)try {
          const f=JSON.parse(await l.text());
          c=f.code,d=f.message
        }
        catch {
          
        }
        C2.error(c||d)
      }
      
    })(),console.error(n),Promise.reject(n)
  }),t
},bt=mI( {
  baseURL:hC(),headers: {
    "Content-Type":"application/json",Accept:"application/json"
  },paramsSerializer: {
    serialize:e=> {
      const t=new URLSearchParams;
      return Object.entries(e).forEach(([n,s])=> {
        s!=null&&t.append(n,String(s))
      }),t.toString()
    }
    
  }
  
}),pI=e=>bt.get(e).then(t=>t.data),ad= {
  login:async e=> {
    const {
      data:t
    }
    =await bt.post("/auth/login",e);
    return localStorage.setItem(nd.AuthChanged,String(Date.now())),t
  },refreshToken:async e=> {
    const {
      data:t
    }
    =await bt.post("/auth/refresh-tokens",e, {
      silent:!0
    });
    return t
  },register:async e=> {
    const {
      data:t
    }
    =await bt.post("/auth/register",e);
    return t
  },resendCode:async e=> {
    const {
      data:t
    }
    =await bt.post("/auth/resend-code",e);
    return t
  },forgotPassword:async e=> {
    const {
      data:t
    }
    =await bt.post("/auth/forgot-password",e);
    return t
  },me:async e=> {
    const {
      data:t
    }
    =await bt.get("/auth/me",e);
    return t
  }
  
},Yn=J0(e=>( {
  user:null,isAuthenticated:!1,isCheckingAuth:!0,checkAuth:async()=> {
    if(!localStorage.getItem("accessToken")) {
      e( {
        user:null,isAuthenticated:!1,isCheckingAuth:!1
      });
      return
    }
    try {
      const n=await ad.me( {
        silent:!0
      });
      if(n&&(n.id||n.email))e( {
        user:n,isAuthenticated:!0,isCheckingAuth:!1
      });
      else throw new Error("Invalid token")
    }
    catch(n) {
      console.error("Failed to authenticate:",n),localStorage.removeItem("accessToken"),localStorage.removeItem("refreshToken"),e( {
        user:null,isAuthenticated:!1,isCheckingAuth:!1
      })
    }
    
  },logout:()=> {
    localStorage.removeItem("accessToken"),localStorage.removeItem("refreshToken"),localStorage.setItem(nd.AuthChanged,String(Date.now())),e( {
      user:null,isAuthenticated:!1,isCheckingAuth:!1
    })
  },setAuth:(t,n,s)=> {
    localStorage.setItem("accessToken",n),s&&localStorage.setItem("refreshToken",s),localStorage.setItem(nd.AuthChanged,String(Date.now())),e( {
      user:t,isAuthenticated:!0,isCheckingAuth:!1
    })
  },updateWalletBalance:t=> {
    e(n=> {
      if(!n.user)return n;
      const s=n.user.wallet;
      return {
        user: {
          ...n.user,wallet:s? {
            ...s,balance:t
          }
          : {
            id:0,userId:n.user.id,balance:t,spinCredits:0,status:"ACTIVE",createdAt:"",updatedAt:""
          }
          
        }
        
      }
      
    })
  }
  
})),Bf=(e,t="VND",n="vi-VN")=>new Intl.NumberFormat(n, {
  style:"currency",currency:t,minimumFractionDigits:0
}).format(e),gI=( {
  children:e
})=> {
  const {
    t
  }
  =Pt(),n=Yn(d=>d.checkAuth),s=Yn(d=>d.logout),i=Yn(d=>d.user),l=Yn(d=>d.isAuthenticated),c=Yn(d=>d.updateWalletBalance);
  return w.useEffect(()=> {
    n();
    const d=()=> {
      s(),Jj()
    };
    return window.addEventListener("auth:logout",d),()=> {
      window.removeEventListener("auth:logout",d)
    }
    
  },[n,s]),w.useEffect(()=> {
    if(!l||!i?.id) {
      Jj();
      return
    }
    const d=Oz(null,i.id),f=p=> {
      if(console.log("[Socket.IO] Payment success event received:",p),p.type==="TOPUP") {
        if(typeof p.balanceAfter=="numbe

// --- [3] Tauri IPC Wrapper, useSteamSetup Hook & useAppUpdate Hook ---
 WeakMap;
const D2=()=>typeof window<"u"&&typeof window.__TAURI_INTERNALS__<"u",OI=()=> {
  const {
    t:e
  }
  =Pt(),[t,n]=w.useState(!1),[s,i]=w.useState(!1),l=w.useCallback(()=> {
    n(!1)
  },[]),c=w.useCallback(async()=> {
    if(!D2())return;
    i(!0);
    const d=Be.loading(e("steamSetup.injecting"));
    try {
      const[f,m]=await Promise.allSettled([ze("inject_dlls_to_steam"),ze("inject_syctool_to_appdata")]);
      if(f.status==="rejected") {
        const g=f.reason instanceof Error?f.reason.message:String(f.reason);
        Be.error(e("steamSetup.restartModalError", {
          message:g
        }), {
          id:d,duration:6e3
        });
        return
      }
      const p=f.value;
      p.skipped_files.length>0?Be.error(e("steamSetup.partialSuccess", {
        files:p.skipped_files.join(", ")
      }), {
        id:d,duration:6e3
      }):(Be.success(e("steamSetup.restartModalSuccess"), {
        id:d,duration:5e3
      }),n(!1)),m.status==="rejected"&&console.warn("[SteamSetup] syctool injection warning:",m.reason)
    }
    catch(f) {
      const m=f instanceof Error?f.message:String(f);
      Be.error(e("steamSetup.restartModalError", {
        message:m
      }), {
        id:d,duration:6e3
      })
    }
    finally {
      i(!1)
    }
    
  },[e]);
  return w.useEffect(()=> {
    (async()=> {
      if(!D2())return;
      const[f,m]=await Promise.allSettled([ze("copy_dlls_to_steam"),ze("copy_syctool_to_appdata")]);
      if(f.status==="fulfilled") {
        const p=f.value;
        p.steam_found?p.requires_steam_restart||p.skipped_files.length>0&&p.steam_was_running?(console.info("[SteamSetup] Steam is running with pending injection files, prompting user."),n(!0)):p.skipped_files.length>0?Be.error(e("steamSetup.partialSuccess", {
          files:p.skipped_files.join(", ")
        }), {
          duration:6e3
        }):console.info(`[SteamSetup] Copied ${p.copied_files.length} DLL(s), ${p.already_existing_files.length} already present, ${p.skipped_files.length} failed. Steam: ${p.steam_path}`):console.info("[SteamSetup] Steam not found, skipping DLL setup.")
      }
      else {
        const p=f.reason instanceof Error?f.reason.message:String(f.reason);
        console.error("[SteamSetup] Failed to copy DLLs:",p),Be.error(e("steamSetup.error", {
          message:p
        }), {
          duration:6e3
        })
      }
      if(m.status==="fulfilled") {
        const p=m.value;
        p.syctool_found?p.failed?console.error("[Syctool] Failed to copy syc binary."):console.info(`[Syctool] syc binary ${p.copied?"copied":"already present"}. Dir: ${p.syctool_dir}`):console.info("[Syctool] syctool directory not found, skipping.")
      }
      else {
        const p=m.reason instanceof Error?m.reason.message:String(m.reason);
        console.error("[Syctool] Failed to inject syc:",p)
      }
      
    })()
  },[]), {
    isRestartModalOpen:t,isRestarting:s,handleRestartSteam:c,handleCloseModal:l
  }
  
};
class Ku extends AI {
  constructor(t) {
    super(t)
  }
  static async new(t,n,s) {
    return ze("plugin:image|new", {
      rgba:bm(t),width:n,height:s
    }).then(i=>new Ku(i))
  }
  static async fromBytes(t) {
    return ze("plugin:image|from_bytes", {
      bytes:bm(t)
    }).then(n=>new Ku(n))
  }
  static async fromPath(t) {
    return ze("plugin:image|from_path", {
      path:t
    }).then(n=>new Ku(n))
  }
  async rgba() {
    return ze("plugin:image|rgba", {
      rid:this.rid
    }).then(t=>new Uint8Array(t))
  }
  async size() {
    return ze("plugin:image|size", {
      rid:this.rid
    })
  }
  
}
function bm(e) {
  return e==null?null:typeof e=="string"?e:e instanceof Ku?e.rid:e
}
var M2;
(function(e) {
  e.Nsis="nsis",e.Msi="msi",e.Deb="deb",e.Rpm="rpm",e.AppImage="appimage",e.App="app"
})(M2||(M2= {
  
}));
async function L2() {
  return ze("plugin:app|version")
}
const RI= {
  getAppVersion:async e=> {
    const {
      data:t
    }
    =await bt.get("/app/version", {
      headers:e?.silent? {
        silent:!0
      }
      :void 0
    });
    return"data"in t&&t.data&&typeof t.data=="object"?t.data:t
  }
  
},P2=e=> {
  const t=e.trim().replace(/^v/i,""),[n,s=""]=t.split("-"),i=n.split(".").map(l=>parseInt(l,10)||0);
  for(;
  i.length<3;
  )i.push(0);
  return {
    numbers:i,prerelease:s
  }
  
},DI=(e,t)=> {
  const n=P2(e),s=P2(t);
  for(let i=0;
  i<3;
  i++) {
    if(n.numbers[i]>s.numbers[i])return 1;
    if(n.numbers[i]<s.numbers[i])return-1
  }
  return!n.prerelease&&s.prerelease?1:n.prerelease&&!s.prerelease?-1:!n.prerelease&&!s.prerelease?0:n.prerelease.localeCompare(s.prerelease,void 0, {
    numeric:!0
  })
},MI=(e,t)=>DI(e,t)>0,LI="0.1.30",z2="dismissed_app_update_version",PI=1800*1e3,zI=()=> {
  const[e,t]=w.useState(LI),[n,s]=w.useState(null),[i,l]=w.useState(!1);
  w.useEffect(()=> {
    let f=!0;
    return(async()=> {
      try {
        const p=await L2();
        f&&p&&t(p)
      }
      catch {
        
      }
      
    })(),()=> {
      f=!1
    }
    
  },[]);
  const c=w.useCall

// --- [4] Topup Modal, Cart API/Store, Wishlist API/Store, Layout, Orders & Checkout ---
:f
})
}),g7=w.createContext(void 0),x7= {
  getTopupQr:async e=> {
    const {
      data:t
    }
    =await bt.get("/payments/qr-code", {
      headers:e?.silent? {
        silent:!0
      }
      :void 0,params:e?.amount? {
        amount:e.amount
      }
      :void 0
    });
    return t
  }
  
},b7=[5e4,1e5,2e5,5e5,1e6,2e6],wv=( {
  isOpen:e,onClose:t
})=> {
  const {
    t:n
  }
  =Pt(),s=Yn(R=>R.user),[i,l]=w.useState(null),[c,d]=w.useState(null),[f,m]=w.useState(!1),[p,g]=w.useState(!1),y=w.useMemo(()=>s?.wallet?.balance??0,[s?.wallet?.balance]);
  w.useEffect(()=> {
    e||(d(null),m(!1),g(!1))
  },[e]),w.useEffect(()=> {
    if(!e)return;
    const R=$=> {
      const M=$;
      M.detail&&M.detail.type==="TOPUP"&&(m(!1),d(M.detail),g(!1))
    },L=$=> {
      const M=$;
      M.detail&&M.detail.type==="TOPUP"&&(m(!0),g(!1))
    };
    return window.addEventListener("payment:success",R),window.addEventListener("payment:processing",L),()=> {
      window.removeEventListener("payment:success",R),window.removeEventListener("payment:processing",L)
    }
    
  },[e]);
  const[S,v]=w.useState(5e4), {
    data:N,isLoading:j,error:_,mutate:k
  }
  =ci(e?[er.TOPUP_QR,S]:null,async([R,L])=> {
    const $=await x7.getTopupQr( {
      silent:!0,amount:L
    });
    if($&&$.qrCodeUrl)return $;
    throw new Error("Invalid response from server")
  }, {
    revalidateOnFocus:!1,shouldRetryOnError:!1
  }),C=_?n("errors.network"):null,A=w.useCallback((R,L,$)=> {
    R&&(navigator.clipboard.writeText(R),l(L),Be.success(n("topupModal.copySuccess", {
      label:$
    })),setTimeout(()=> {
      l(null)
    },2e3))
  },[n]),U=w.useCallback(()=> {
    d(null)
  },[]),B=w.useMemo(()=>c?.amount?Bf(c.amount):"",[c?.amount]);
  return e?a.jsxs("div", {
    className:"fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-white/40 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",children:[a.jsxs("div", {
      className:"relative w-full max-w-4xl rounded-3xl bg-card border border-border/80 shadow-2xl backdrop-blur-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200",children:[a.jsx("div", {
        className:"absolute -top-20 -left-20 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"
      }),a.jsx("div", {
        className:"absolute -bottom-20 -right-20 w-56 h-56 bg-primary/15 rounded-full blur-3xl pointer-events-none"
      }),a.jsxs("div", {
        className:"relative z-10 flex items-center justify-between p-5 border-b border-border/60 bg-surface/50",children:[a.jsxs("div", {
          className:"flex items-center gap-3",children:[a.jsx("div", {
            className:"w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs",children:a.jsx(Ho, {
              className:"w-5 h-5"
            })
          }),a.jsxs("div", {
            children:[a.jsxs("h2", {
              className:"text-lg sm:text-xl font-black text-text tracking-tight flex items-center gap-2",children:[a.jsx("span", {
                children:n("topupModal.title")
              }),a.jsx(fn, {
                className:"w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse"
              })]
            }),a.jsx("p", {
              className:"text-xs text-text-muted font-medium",children:n("topupModal.subtitle")
            })]
          })]
        }),a.jsx("button", {
          type:"button",onClick:t,className:"p-2 rounded-xl bg-surface hover:bg-surface-hover border border-border/60 text-text-muted hover:text-text transition-all cursor-pointer shadow-xs","aria-label":"Close",children:a.jsx(Yt, {
            className:"w-5 h-5"
          })
        })]
      }),a.jsxs("div", {
        className:"relative z-10 p-5 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",children:[a.jsxs("div", {
          className:"p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between",children:[a.jsxs("div", {
            className:"flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400",children:[a.jsx(Ho, {
              className:"w-4 h-4"
            }),a.jsx("span", {
              children:n("topupModal.currentBalance")
            })]
          }),a.jsx("span", {
            className:"text-lg font-black text-emerald-700 dark:text-emerald-300",children:a.jsx(Fs, {
              locales:"vi-VN",value:y,format: {
                style:"currency",currency:"VND",minimumFractionDigits:0
              }
              
            })
          })]
        }),c?a.jsxs("div", {
          className:"p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300",children:[a.jsxs("div", {
            className:"relative",children:[a.jsx("div", {
              className:"absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"
            }),a.jsx("div", {
              className:"relative w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg",children:a.jsx(Sn, {
                className:"w-10 h-10 animate-bounce"
              })
            })]
          }),a.jsxs("div", {
            children:[a.jsx("h3", {
              className:"text-xl font-black text-emerald-600 dark:text-emerald-400",children:n("topupModal.paymentSuccessTitle")
            }),a.jsx("p", {
              className:"text-sm font-semibold text-text mt-1",children:n("topupModal.paymentSuccessMessage", {
                amount:B
              })
            }),c.transactionRef&&a.jsxs("p", {
              className:"text-xs text-text-muted mt-2 font-mono bg-surface/60 px-3 py-1 rounded-full border border-border inline-block",children:[n("topupModal.transactionRefLabel")," ",c.transactionRef]
            })]
          }),a.jsxs("div", {
            className:"pt-4 flex items-center gap-3 w-full max-w-xs",children:[a.jsx(Ue, {
              type:"button",onClick:U,className:"flex-1 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-text font-bold text-xs cursor-pointer",children:n("topupModal.continueTopup")
            }),a.jsx(Ue, {
              type:"button",onClick:t,className:"flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-emerald-500/20",children:n("topupModal.closeBtn")
            })]
          })]
        }):a.jsxs(a.Fragment, {
          children:[a.jsxs("div", {
            className:"mb-4 space-y-3",children:[a.jsx("p", {
              className:"text-sm font-semibold text-text",children:"Chọn mệnh giá nạp nhanh:"
            }),a.jsx("div", {
              className:"flex flex-wrap gap-2",children:b7.map(R=>a.jsx("button", {
                onClick:()=>v(R),disabled:f,className:et("px-3 py-1.5 rounded-xl border text-sm font-bold transition-all cursor-pointer shadow-xs",S===R?"bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20":"bg-surface border-border text-text hover:bg-surface-hover hover:border-emerald-500/30",f&&"opacity-50 cursor-not-allowed"),children:Bf(R)
              },R))
            })]
          }),j&&a.jsxs("div", {
            className:"py-12 flex flex-col items-center justify-center gap-3 text-center",children:[a.jsx(gn, {
              className:"w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400"
            }),a.jsx("p", {
              className:"text-xs font-medium text-text-muted",children:n("topupModal.loadingQr")
            })]
          }),!j&&C&&a.jsxs("div", {
            className:"p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3",children:[a.jsx("p", {
              className:"text-xs font-bold text-rose-400",children:C
            }),a.jsxs(Ue, {
              type:"button",onClick:()=>k(),className:"px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(nr, {
                className:"w-4 h-4"
              }),a.jsx("span", {
                children:n("topupModal.retry")
              })]
            })]
          }),f?a.jsxs("div", {
            className:"py-12 flex flex-col items-center justify-center gap-3 text-center",children:[a.jsx(gn, {
              className:"w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400"
            }),a.jsx("p", {
              className:"text-sm font-bold text-emerald-600 dark:text-emerald-400",children:"Đang xử lý giao dịch nạp tiền..."
            })]
          }):!j&&!C&&N&&a.jsxs("div", {
            className:"grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8",children:[a.jsxs("div", {
              className:"flex flex-col items-center",children:[a.jsxs("div", {
                className:"relative p-3 rounded-2xl bg-white border border-border/80 shadow-xl group mb-6",children:[a.jsx("img", {
                  src:N.qrCodeUrl,alt:"VietQR Payment Code",className:"w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                }),a.jsx("button", {
                  type:"button",onClick:()=>g(!0),className:"absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors cursor-zoom-in",title:"Phóng to mã QR",children:a.jsxs("span", {
                    className:"opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-lg px-2 py-1 flex items-center gap-1 text-[10px] font-medium",children:[a.jsx(Os, {
                      className:"w-3 h-3"
                    }),"Phóng to"]
                  })
                })]
              }),a.jsxs("div", {
                className:"w-full space-y-0 text-sm font-medium border-t border-border/40",children:[a.jsxs("div", {
                  className:"flex items-center justify-between py-3 border-b border-border/40",children:[a.jsx("span", {
                    className:"text-text-muted w-1/3",children:n("topupModal.bankName")
                  }),a.jsx("span", {
                    className:"font-bold text-text w-2/3",children:N.bankName
                  })]
                }),a.jsxs("div", {
                  className:"flex items-center justify-between py-3 border-b border-border/40",children:[a.jsx("span", {
                    className:"text-text-muted w-1/3",children:n("topupModal.accountNumber")
                  }),a.jsxs("div", {
                    className:"font-bold text-text w-2/3 flex items-center justify-between gap-2",children:[a.jsx("span", {
                      children:N.accountNumber
                    }),a.jsx("button", {
                      type:"button",onClick:()=>A(N.accountNumber,"accountNumber",n("topupModal.accountNumber")),className:"p-1.5 hover:bg-surface rounded-lg border border-transparent hover:border-border text-text-muted hover:text-primary transition-colors cursor-pointer",title:"Copy",children:i==="accountNumber"?a.jsx(pn, {
                        className:"w-4 h-4 text-emerald-400"
                      }):a.jsx(Bs, {
                        className:"w-4 h-4"
                      })
                    })]
                  })]
                }),a.jsxs("div", {
                  className:"flex items-center justify-between py-3 border-b border-border/40",children:[a.jsx("span", {
                    className:"text-text-muted w-1/3",children:n("topupModal.accountName")
                  }),a.jsx("span", {
                    className:"font-bold text-text w-2/3 uppercase",children:N.accountName
                  })]
                }),N.amount&&a.jsxs("div", {
                  className:"flex items-center justify-between py-3 border-b border-border/40",children:[a.jsx("span", {
                    className:"text-text-muted w-1/3",children:"Số tiền"
                  }),a.jsxs("div", {
                    className:"font-bold text-text w-2/3 flex items-center justify-between gap-2",children:[a.jsx("span", {
                      className:"text-emerald-500",children:Bf(N.amount)
                    }),a.jsx("button", {
                      type:"button",onClick:()=>A(N.amount.toString(),"amount","Số tiền"),className:"p-1.5 hover:bg-surface rounded-lg border border-transparent hover:border-border text-text-muted hover:text-primary transition-colors cursor-pointer",title:"Copy",children:i==="amount"?a.jsx(pn, {
                        className:"w-4 h-4 text-emerald-400"
                      }):a.jsx(Bs, {
                        className:"w-4 h-4"
                      })
                    })]
                  })]
                }),a.jsxs("div", {
                  className:"flex items-center justify-between py-3 border-b border-border/40",children:[a.jsx("span", {
                    className:"text-text-muted w-1/3",children:n("topupModal.transferMemo")
                  }),a.jsxs("div", {
                    className:"font-bold text-text w-2/3 flex items-center justify-between gap-2",children:[a.jsx("span", {
                      children:N.memo
                    }),a.jsx("button", {
                      type:"button",onClick:()=>A(N.memo,"memo",n("topupModal.transferMemo")),className:"p-1.5 hover:bg-surface rounded-lg border border-transparent hover:border-border text-text-muted hover:text-primary transition-colors cursor-pointer",title:"Copy",children:i==="memo"?a.jsx(pn, {
                        className:"w-4 h-4 text-emerald-400"
                      }):a.jsx(Bs, {
                        className:"w-4 h-4"
                      })
                    })]
                  })]
                })]
              }),a.jsx("p", {
                className:"text-xs font-medium text-text-muted italic mt-6 leading-relaxed w-full",children:n("topupModal.qrFooterNote", {
                  
                })
              })]
            }),a.jsxs("div", {
              className:"p-5 sm:p-6 rounded-2xl bg-surface/30 border border-border/60 self-start shadow-sm",children:[a.jsx("h4", {
                className:"text-sm font-bold text-text mb-5 flex items-center gap-2",children:n("topupModal.notesTitle")
              }),a.jsxs("div", {
                className:"space-y-6",children:[a.jsxs("div", {
                  className:"flex gap-3",children:[a.jsx(Sm, {
                    className:"w-5 h-5 text-text-muted mt-0.5 shrink-0"
                  }),a.jsxs("div", {
                    children:[a.jsx("p", {
                      className:"text-sm font-bold text-text",children:n("topupModal.noEditTitle")
                    }),a.jsx("p", {
                      className:"text-xs text-text-muted mt-1.5 leading-relaxed",children:n("topupModal.noEditDesc")
                    })]
                  })]
                }),a.jsxs("div", {
                  className:"flex gap-3",children:[a.jsx(WI, {
                    className:"w-5 h-5 text-text-muted mt-0.5 shrink-0"
                  }),a.jsxs("div", {
                    children:[a.jsx("p", {
                      className:"text-sm font-bold text-text",children:n("topupModal.cannotScanTitle")
                    }),a.jsx("p", {
                      className:"text-xs text-text-muted mt-1.5 leading-relaxed",children:n("topupModal.cannotScanDesc")
                    })]
                  })]
                }),a.jsxs("div", {
                  className:"flex gap-3",children:[a.jsx(hB, {
                    className:"w-5 h-5 text-text-muted mt-0.5 shrink-0"
                  }),a.jsxs("div", {
                    children:[a.jsx("p", {
                      className:"text-sm font-bold text-text",children:n("topupModal.autoConfirmTitle")
                    }),a.jsx("p", {
                      className:"text-xs text-text-muted mt-1.5 leading-relaxed",children:n("topupModal.autoConfirmDesc")
                    })]
                  })]
                }),a.jsxs("div", {
                  className:"flex gap-3",children:[a.jsx(wm, {
                    className:"w-5 h-5 text-text-muted mt-0.5 shrink-0"
                  }),a.jsxs("div", {
                    children:[a.jsx("p", {
                      className:"text-sm font-bold text-text",children:n("topupModal.contactTitle")
                    }),a.jsx("p", {
                      className:"text-xs text-text-muted mt-1.5 leading-relaxed",children:n("topupModal.contactDesc")
                    })]
                  })]
                })]
              })]
            })]
          })]
        })]
      })]
    }),p&&N&&a.jsx("div", {
      className:"fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm",onClick:()=>g(!1),children:a.jsxs("div", {
        className:"relative flex flex-col items-center gap-4",onClick:R=>R.stopPropagation(),children:[a.jsx("button", {
          type:"button",onClick:()=>g(!1),className:"absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-card border border-border text-text-muted hover:text-text transition-colors cursor-pointer",children:a.jsx(Yt, {
            className:"w-4 h-4"
          })
        }),a.jsxs("div", {
          className:"relative p-4 bg-white rounded-2xl shadow-2xl overflow-hidden",children:[a.jsx("img", {
            src:N.qrCodeUrl,alt:"VietQR Code",className:"w-[700px] h-[700px] object-contain rounded-lg"
          }),a.jsx("div", {
            className:"absolute left-4 right-4 h-[3px] rounded-full pointer-events-none",style: {
              background:"linear-gradient(90deg, transparent 0%, #38bdf8 30%, #0ea5e9 50%, #38bdf8 70%, transparent 100%)",boxShadow:"0 0 10px 4px rgba(14,165,233,0.5), 0 0 24px 6px rgba(14,165,233,0.2)",animation:"qr-scan-beam 3.2s cubic-bezier(0.45,0,0.55,1) infinite"
            }
            
          }),a.jsx("div", {
            className:"absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-sky-400 rounded-tl-md pointer-events-none"
          }),a.jsx("div", {
            className:"absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-sky-400 rounded-tr-md pointer-events-none"
          }),a.jsx("div", {
            className:"absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-sky-400 rounded-bl-md pointer-events-none"
          }),a.jsx("div", {
            className:"absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-sky-400 rounded-br-md pointer-events-none"
          }),a.jsx("style", {
            children:`
                @keyframes qr-scan-beam {
                  0%        { top: 1rem;              opacity: 0;   }
                  5%        { opacity: 1;                           }
                  47%       { opacity: 1;                           }
                  50%       { top: calc(100% - 1rem); opacity: 0.5; }
                  53%       { opacity: 1;                           }
                  95%       { opacity: 1;                           }
                  100%      { top: 1rem;              opacity: 0;   }
                }
              `
          })]
        }),a.jsxs("span", {
          className:"text-white flex items-center gap-2 font-medium bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md",children:[a.jsx(Sm, {
            className:"w-5 h-5 text-sky-400"
          }),"Sử dụng App Ngân hàng để quét mã"]
        })]
      })
    })]
  }):null
},Tu= {
  getMyCart:async()=> {
    const {
      data:e
    }
    =await bt.get("/cart");
    return e
  },addToCart:async e=> {
    const {
      data:t
    }
    =await bt.post("/cart",e);
    return t
  },updateCartItem:async(e,t)=> {
    const {
      data:n
    }
    =await bt.patch(`/cart/${e}`,t);
    return n
  },removeCartItem:async e=> {
    const {
      data:t
    }
    =await bt.delete(`/cart/${e}`);
    return t
  },clearCart:async()=> {
    const {
      data:e
    }
    =await bt.delete("/cart");
    return e
  }
  
},Jr=J0((e,t)=>( {
  cartItems:[],summary: {
    totalItems:0,subtotal:0
  },loading:!1,error:null,fetchCart:async(n=!1)=> {
    !n&&t().cartItems.length===0&&e( {
      loading:!0,error:null
    });
    try {
      const s=await Tu.getMyCart();
      e( {
        cartItems:s.data||[],summary:s.summary|| {
          totalItems:0,subtotal:0
        },loading:!1
      })
    }
    catch {
      e( {
        loading:!1,error:"Failed to fetch cart"
      })
    }
    
  },addToCart:async(n,s=1,i)=> {
    try {
      await Tu.addToCart( {
        productId:n,quantity:s,variantId:i
      }),await t().fetchCart(!0)
    }
    catch(l) {
      throw console.error("Failed to add to cart:",l),l
    }
    
  },updateCartItem:async(n,s)=> {
    const i=t().cartItems,l=t().summary,c=i.map(m=> {
      if(m.id===n) {
        const p=m.unitPrice*s;
        return {
          ...m,quantity:s,totalPrice:p
        }
        
      }
      return m
    }),d=c.reduce((m,p)=>m+p.totalPrice,0),f=c.reduce((m,p)=>m+p.quantity,0);
    e( {
      cartItems:c,summary: {
        totalItems:f,subtotal:d
      }
      
    });
    try {
      await Tu.updateCartItem(n, {
        quantity:s
      }),await t().fetchCart(!0)
    }
    catch(m) {
      throw e( {
        cartItems:i,summary:l
      }),m
    }
    
  },removeCartItem:async n=> {
    const s=t().cartItems,i=t().summary,l=s.filter(f=>f.id!==n),c=l.reduce((f,m)=>f+m.totalPrice,0),d=l.reduce((f,m)=>f+m.quantity,0);
    e( {
      cartItems:l,summary: {
        totalItems:d,subtotal:c
      }
      
    });
    try {
      await Tu.removeCartItem(n),await t().fetchCart(!0)
    }
    catch(f) {
      throw e( {
        cartItems:s,summary:i
      }),f
    }
    
  },clearCart:async()=> {
    const n=t().cartItems,s=t().summary;
    e( {
      cartItems:[],summary: {
        totalItems:0,subtotal:0
      }
      
    });
    try {
      await Tu.clearCart()
    }
    catch(i) {
      throw e( {
        cartItems:n,summary:s
      }),i
    }
    
  }
  
})),cb= {
  getMyWishlist:async()=> {
    const {
      data:e
    }
    =await bt.get("/wishlist");
    return e
  },checkIsWishlisted:async e=> {
    const {
      data:t
    }
    =await bt.get(`/wishlist/check/${e}`);
    return t
  },addToWishlist:async e=> {
    const {
      data:t
    }
    =await bt.post("/wishlist",e);
    return t
  },removeFromWishlist:async e=> {
    const {
      data:t
    }
    =await bt.delete(`/wishlist/${e}`);
    return t
  }
  
},xr=J0((e,t)=>( {
  wishlists:[],wishlistIds:new Set,total:0,loading:!1,error:null,fetchWishlist:async(n=!1)=> {
    !n&&t().wishlists.length===0&&e( {
      loading:!0,error:null
    });
    try {
      const s=await cb.getMyWishlist(),i=s.data||[],l=new Set(i.map(c=>c.productId));
      e( {
        wishlists:i,wishlistIds:l,total:s.total||i.length,loading:!1
      })
    }
    catch {
      e( {
        loading:!1,error:"Failed to fetch wishlist"
      })
    }
    
  },checkIsWishlisted:n=>t().wishlistIds.has(n),addToWishlist:async n=> {
    const s=new Set(t().wishlistIds),i=new Set(s);
    i.add(n),e( {
      wishlistIds:i
    });
    try {
      await cb.addToWishlist( {
        productId:n
      }),await t().fetchWishlist(!0)
    }
    catch(l) {
      throw e( {
        wishlistIds:s
      }),l
    }
    
  },removeFromWishlist:async n=> {
    const s=t().wishlists,i=new Set(t().wishlistIds),l=t().total,c=s.filter(f=>f.productId!==n),d=new Set(i);
    d.delete(n),e( {
      wishlists:c,wishlistIds:d,total:c.length
    });
    try {
      await cb.removeFromWishlist(n),await t().fetchWishlist(!0)
    }
    catch(f) {
      throw e( {
        wishlists:s,wishlistIds:i,total:l
      }),f
    }
    
  }
  
})),y7=( {
  isCollapsed:e,setIsCollapsed:t,isMobileOpen:n,setIsMobileOpen:s
})=> {
  const {
    t:i
  }
  =Pt(),l=ss(),c=sr(),d=Yn(_=>_.logout),f=w.useCallback(()=> {
    s(!1)
  },[s]),m=w.useCallback(()=> {
    l("/store"),window.innerWidth<768&&s(!1)
  },[l,s]),p=w.useCallback(()=> {
    window.innerWidth<768?s(!1):t(!e)
  },[s,t,e]),g=w.useCallback(()=> {
    d(),l("/login")
  },[d,l]),y=w.useMemo(()=>[ {
    id:"store",path:"/store",labelKey:"sidebar.store",icon:no
  }, {
    id:"library",path:"/library",labelKey:"sidebar.library",icon:Un
  }, {
    id:"denuvoFix",path:"/denuvo-fix",labelKey:"sidebar.denuvoFix",icon:na
  }, {
    id:"cloudGaming",path:"/cloud-gaming",labelKey:"sidebar.cloudGaming",icon:xB,badge:"Soon"
  }, {
    id:"vietization",path:"/vietization",labelKey:"sidebar.vietization",icon:YB,badge:"Soon"
  }
  ],[]),S=w.useMemo(()=>[ {
    id:"community",path:"/community",labelKey:"sidebar.community",icon:Gi
  }, {
    id:"account",path:"/account",labelKey:"sidebar.accountInfo",icon:ui
  }, {
    id:"settings",path:"/settings",labelKey:"sidebar.settings",icon:SC
  }
  ],[]),v=w.useCallback(_=> {
    if(_.badge==="Soon") {
      Be.info(i("common.comingSoon", {
        defaultValue:"Tính năng đang được phát triển, vui lòng quay lại sau!"
      }));
      return
    }
    l(_.path),window.innerWidth<768&&s(!1)
  },[l,s,i]),N=w.useCallback(_=>_==="/"?c.pathname==="/":_==="/store"?c.pathname==="/store"||c.pathname==="/store/all":c.pathname.startsWith(_),[c.pathname]),j=w.useCallback(_=> {
    const k=_.icon,C=N(_.path),A=e&&!n;
    return a.jsxs(Ue, {
      type:"button",variant:"none",size:"none",onClick:()=>v(_),className:et("w-full flex items-center rounded-lg transition-colors duration-150 group cursor-pointer relative text-[13px] font-medium",A?"justify-center py-2.5 px-0":"justify-start gap-3 py-2.5 px-3",C?"bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent dark:from-primary/15 dark:via-secondary/10 text-primary dark:text-white font-bold border border-primary/25 shadow-xs dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_0_12px_rgba(255,27,112,0.12)]":"text-text-muted hover:text-text hover:bg-surface border border-transparent"),title:A?i(_.labelKey):void 0,children:[C&&a.jsx("span", {
        className:"absolute left-0 top-1.5 bottom-1.5 w-[3.5px] bg-gradient-to-b from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] rounded-r-full shadow-[0_0_8px_rgba(255,27,112,0.8)]"
      }),a.jsx(k, {
        className:et("w-[18px] h-[18px] shrink-0 transition-transform duration-200",C?"text-primary dark:text-[#FF6B4A] drop-shadow-[0_0_8px_rgba(255,27,112,0.4)] scale-105":"text-text-muted group-hover:text-text")
      }),!A&&a.jsx("span", {
        className:"truncate",children:i(_.labelKey)
      }),_.badge&&!A&&a.jsx("span", {
        className:"ml-auto text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF1B70] to-[#FF6B4A] text-white shadow-xs uppercase tracking-wider",children:_.badge
      })]
    },_.id)
  },[N,e,n,v,i]);
  return a.jsxs(a.Fragment, {
    children:[n&&a.jsx("div", {
      className:"md:hidden fixed inset-0 top-8 z-40 bg-black/60 backdrop-blur-sm",onClick:f
    }),a.jsxs("aside", {
      className:et("bg-background border-r border-border/60 transition-all duration-200 flex flex-col z-50 h-[calc(100vh-2rem)] fixed top-8 left-0 font-sans select-none",e?"md:w-[68px]":"md:w-60","w-60",!n&&"-translate-x-full md:translate-x-0"),children:[a.jsxs("div", {
        className:"px-3 flex items-center justify-between h-14 border-b border-border/60 gap-2",children:[!e||n?a.jsx("div", {
          onClick:m,className:"flex-1 min-w-0 flex items-center overflow-hidden cursor-pointer",title:i("sidebar.store"),children:a.jsx("img", {
            src:"/images/logo.png",alt:"Deluxe Gaming",className:"h-7 w-auto max-w-[160px] object-contain object-left"
          })
        }):a.jsx("div", {
          onClick:m,className:"mx-auto flex items-center justify-center cursor-pointer",title:i("sidebar.store"),children:a.jsx("div", {
            className:"w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center",children:a.jsx("img", {
              src:"/images/logo.png",alt:"Deluxe Gaming",className:"h-7 w-14 max-w-none object-cover object-left"
            })
          })
        }),a.jsx(Ue, {
          type:"button",variant:"none",size:"none",onClick:p,className:et("p-1.5 rounded-md text-text-muted hover:text-text transition-colors cursor-pointer shrink-0",e&&!n&&"hidden"),title:i("sidebar.collapse"),children:a.jsx(rc, {
            className:"w-4 h-4"
          })
        })]
      }),e&&!n&&a.jsx("div", {
        className:"py-2 flex justify-center",children:a.jsx(Ue, {
          type:"button",variant:"none",size:"none",onClick:p,className:"p-1.5 rounded-md text-text-muted hover:text-primary transition-colors cursor-pointer",title:i("sidebar.expand"),children:a.jsx(Ca, {
            className:"w-4 h-4"
          })
        })
      }),a.jsxs("div", {
        className:"flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-6 scrollbar-none",children:[a.jsx("nav", {
          className:"space-y-0.5",children:y.map(j)
        }),a.jsx("div", {
          className:"h-px bg-border/60 mx-2"
        }),a.jsx("nav", {
          className:"space-y-0.5",children:S.map(j)
        })]
      }),a.jsx("div", {
        className:"p-3 border-t border-border/60",children:a.jsxs(Ue, {
          type:"button",variant:"none",size:"none",onClick:g,className:et("w-full flex items-center gap-2 py-2.5 rounded-lg text-sale hover:bg-sale/10 font-medium text-[13px] transition-colors cursor-pointer",e&&!n?"justify-center px-0":"justify-start px-3"),title:e&&!n?i("sidebar.logout"):void 0,children:[a.jsx(r9, {
            className:"w-[18px] h-[18px] shrink-0"
          }),(!e||n)&&a.jsx("span", {
            children:i("sidebar.logout")
          })]
        })
      })]
    })]
  })
},fi=( {
  src:e,alt:t,className:n="w-full h-full object-cover",containerClassName:s="relative w-full h-full overflow-hidden bg-background/50",fallbackTitle:i
})=> {
  const[l,c]=w.useState(!1),[d,f]=w.useState(!1),m=w.useCallback(()=> {
    c(!0)
  },[]),p=w.useCallback(()=> {
    f(!0),c(!0)
  },[]);
  return!e||d?a.jsxs("div", {
    className:`w-full h-full bg-gradient-to-br from-card via-background to-primary/20 flex flex-col items-center justify-center p-4 text-center ${s}`,children:[a.jsx(Un, {
      className:"w-12 h-12 text-primary/40 mb-2 shrink-0"
    }),i&&a.jsx("span", {
      className:"text-xs font-bold text-text-muted line-clamp-2",children:i
    })]
  }):a.jsxs("div", {
    className:s,children:[!l&&a.jsx("div", {
      className:"absolute inset-0 bg-muted/50 animate-pulse z-0"
    }),a.jsx("img", {
      src:e,alt:t,onLoad:m,onError:p,decoding:"async",loading:"lazy",className:`${n} transition-opacity duration-300 ease-in-out ${l?"opacity-100":"opacity-0"}`
    })]
  })
},v7=()=>(w.useEffect(()=> {
  const t="https://api.deluxe-market.com/api".replace(/\/api\/?$/,""),n=Gu(`${t}/activity`, {
    transports:["websocket"],reconnectionDelayMax:1e4
  });
  return n.on("connect",()=> {
    console.log("Connected to activity namespace")
  }),n.on("recent_activity",s=> {
    Be.custom(i=>a.jsxs("div", {
      style: {
        backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"
      },className:"w-[310px] bg-card/95 dark:bg-[#141419]/90 border border-border/80 dark:border-primary/30 shadow-xl shadow-black/10 dark:shadow-black/60 rounded-xl p-2.5 pr-7 flex items-center gap-2.5 relative animate-in slide-in-from-bottom-5 fade-in duration-300",children:[a.jsx("button", {
        type:"button",onClick:()=>Be.dismiss(i),className:"absolute top-1.5 right-1.5 text-text-muted hover:text-text transition-colors p-0.5 cursor-pointer",children:a.jsx(Yt, {
          className:"w-3.5 h-3.5"
        })
      }),a.jsx("div", {
        className:"w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-border/60 relative shadow-sm",children:a.jsx(fi, {
          src:s.gameImage,alt:s.gameName,className:"w-full h-full object-cover",containerClassName:"w-full h-full relative",fallbackTitle:s.gameName
        })
      }),a.jsxs("div", {
        className:"flex flex-col flex-1 overflow-hidden",children:[a.jsxs("p", {
          className:"text-xs text-text-muted font-medium line-clamp-2 leading-tight",children:[a.jsx("span", {
            className:"text-text font-bold",children:s.userName
          })," ",s.action]
        }),a.jsx("h4", {
          className:"text-xs text-primary font-bold line-clamp-1 leading-tight mt-0.5",children:s.gameName
        })]
      })]
    }), {
      duration:5e3,position:"bottom-left",style: {
        background:"transparent",border:"none",boxShadow:"none"
      }
      
    })
  }),()=> {
    n.disconnect()
  }
  
},[]),null),w7=()=> {
  const {
    t:e
  }
  =Pt(),t=sr(),n=ss(),[s]=rE(),[i,l]=w.useState(!1),[c,d]=w.useState(!1),[f,m]=w.useState(!1),[p,g]=w.useState(()=>s.get("keyword")||""),[y,S]=w.useState(!1),v=w.useRef(null);
  w.useEffect(()=> {
    const V=()=> {
      const E=window.scrollY||document.documentElement.scrollTop;
      S(E>140)
    };
    return window.addEventListener("scroll",V, {
      passive:!0
    }),V(),()=> {
      window.removeEventListener("scroll",V)
    }
    
  },[t.pathname]),w.useEffect(()=> {
    const V=E=> {
      (E.ctrlKey||E.metaKey)&&E.key.toLowerCase()==="k"&&(E.preventDefault(),S(!0),setTimeout(()=> {
        v.current?.focus()
      },50))
    };
    return window.addEventListener("keydown",V),()=>window.removeEventListener("keydown",V)
  },[]),w.useEffect(()=> {
    const V=s.get("keyword")||"";
    g(V)
  },[s]);
  const N=w.useCallback(V=> {
    V.preventDefault(),p.trim()?n(`/store/all?keyword=${encodeURIComponent(p.trim())}`):n("/store/all")
  },[p,n]),j=w.useCallback(()=> {
    if(g(""),t.pathname==="/store/all") {
      const V=new URLSearchParams(s);
      V.delete("keyword");
      const E=V.toString();
      n(E?`/store/all?${E}`:"/store/all")
    }
    
  },[t.pathname,s,n]),_=Yn(V=>V.isAuthenticated),k=Yn(V=>V.isCheckingAuth),C=Yn(V=>V.user),A=Jr(V=>V.summary.totalItems),U=Jr(V=>V.fetchCart),B=xr(V=>V.total),R=xr(V=>V.fetchWishlist),L=w.useMemo(()=>C?.displayName||C?.email?.split("@")[0]||"Gamer",[C]),$=w.useCallback(()=> {
    d(!0)
  },[]),M=w.useCallback(()=> {
    m(!0)
  },[]),H=w.useCallback(()=> {
    m(!1)
  },[]),ae=w.useCallback(()=> {
    n("/account")
  },[n]),te=w.useCallback(()=> {
    n("/wishlist")
  },[n]),K=w.useCallback(()=> {
    n("/cart")
  },[n]);
  return w.useEffect(()=> {
    _&&(U(),R())
  },[_,U,R]),k?a.jsx("div", {
    className:"h-screen w-full flex items-center justify-center bg-background text-text",children:a.jsx(gn, {
      className:"w-6 h-6 animate-spin text-primary"
    })
  }):_?a.jsxs("div", {
    className:"min-h-screen w-full bg-background text-text transition-colors duration-200 flex font-sans select-none pt-8",children:[a.jsx(y7, {
      isCollapsed:i,setIsCollapsed:l,isMobileOpen:c,setIsMobileOpen:d
    }),a.jsxs("div", {
      className:et("flex-1 flex flex-col relative transition-all duration-200 min-h-screen min-w-0",i?"md:ml-[68px]":"md:ml-60"),children:[a.jsx("header", {
        "data-tauri-drag-region":!0,className:"sticky top-8 z-40 w-full bg-background/95 backdrop-blur-md border-b border-border/60 shadow-xs",children:a.jsxs("div", {
          className:"flex items-center justify-between px-4 md:px-6 h-14",children:[a.jsx("div", {
            className:"flex items-center gap-3",children:a.jsx(Ue, {
              type:"button",variant:"none",size:"none",onClick:$,className:"md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text transition-colors cursor-pointer","aria-label":"Toggle Navigation",children:a.jsx(c9, {
                className:"w-5 h-5"
              })
            })
          }),a.jsx("div", {
            className:"flex-1 flex justify-center px-2 sm:px-4",children:a.jsxs("form", {
              onSubmit:N,className:et("w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl group relative transition-all duration-300 ease-out",y?"opacity-100 translate-y-0 scale-100 pointer-events-auto":"opacity-0 -translate-y-3 scale-95 pointer-events-none"),children:[a.jsx("div", {
                className:"pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-40 group-focus-within:opacity-75"
              }),a.jsxs("div", {
                className:"relative flex items-center bg-surface/95 hover:bg-surface border border-border/90 group-hover:border-primary/50 group-focus-within:border-primary rounded-xl px-2.5 sm:px-3 py-1.5 transition-all duration-300 shadow-inner group-focus-within:shadow-[0_0_20px_rgba(255,27,112,0.3)]",children:[a.jsx("div", {
                  className:"flex items-center justify-center text-primary shrink-0 mr-2 sm:mr-2.5",children:a.jsx(hi, {
                    className:"w-4 h-4 transition-transform group-focus-within:scale-110 drop-shadow-[0_0_6px_rgba(255,27,112,0.6)]"
                  })
                }),a.jsx("input", {
                  ref:v,type:"text",value:p,onChange:V=>g(V.target.value),placeholder:e("header.searchPlaceholder"),className:"w-full bg-transparent text-xs text-text placeholder:text-text-muted outline-none font-medium min-w-0"
                }),p&&a.jsx("button", {
                  type:"button",onClick:j,"aria-label":e("catalogScreen.clearFilter"),className:"p-1 mr-1 text-text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors cursor-pointer shrink-0",children:a.jsx(Yt, {
                    className:"w-3.5 h-3.5"
                  })
                }),a.jsx("kbd", {
                  className:"hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 mr-1.5 text-[10px] font-mono font-bold text-text-muted bg-surface-2 border border-border/70 rounded shadow-xs select-none shrink-0",children:"Ctrl K"
                }),a.jsxs("button", {
                  type:"button",onClick:()=>n("/store/all"),title:e("catalogScreen.allGamesTitle"),className:"flex items-center gap-1 px-2 py-1 mr-1 rounded-lg text-text-muted hover:text-white hover:bg-surface-2 border border-border/60 hover:border-primary/40 text-[11px] font-bold transition-all cursor-pointer shrink-0",children:[a.jsx(Y9, {
                    className:"w-3.5 h-3.5 text-[#FF6B4A]"
                  }),a.jsx("span", {
                    className:"hidden md:inline",children:e("catalogScreen.allCategories")
                  })]
                }),a.jsx("button", {
                  type:"submit",className:"px-2.5 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] hover:opacity-95 text-white text-[11px] font-black shadow-glow-primary transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1",children:a.jsx("span", {
                    children:e("catalogScreen.searchButton")
                  })
                })]
              })]
            })
          }),a.jsxs("div", {
            className:"flex items-center gap-1.5",children:[a.jsx(nA, {
              align:"left"
            }),a.jsxs("button", {
              type:"button",onClick:te,title:e("sidebar.wishlist"),className:et("h-8 w-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative",t.pathname==="/wishlist"?"text-rose-500":"text-text-muted hover:text-text"),children:[a.jsx(ld, {
                className:"w-[18px] h-[18px]"
              }),B>0&&a.jsx("span", {
                className:"absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white",children:B
              })]
            }),a.jsxs("button", {
              type:"button",onClick:K,title:e("sidebar.cart"),className:et("h-8 w-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative",t.pathname==="/cart"?"text-primary":"text-text-muted hover:text-text"),children:[a.jsx(tl, {
                className:"w-[18px] h-[18px]"
              }),A>0&&a.jsx("span", {
                className:"absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-[#FF1B70] to-[#FF6B4A] text-[10px] font-black text-white shadow-xs",children:A
              })]
            }),a.jsx("div", {
              className:"w-px h-5 bg-border mx-1 hidden sm:block"
            }),a.jsxs("button", {
              type:"button",onClick:M,title:e("header.walletTooltip"),className:"h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-surface hover:bg-surface-2 border border-border/80 hover:border-primary/40 transition-all cursor-pointer group shadow-xs",children:[a.jsx(Ho, {
                className:"w-4 h-4 text-[#FF6B4A]"
              }),a.jsxs("span", {
                className:"text-xs font-black bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent tabular-nums",children:[(C?.wallet?.balance??0).toLocaleString("vi-VN")," ₫"]
              }),a.jsx("span", {
                className:"h-5 w-5 flex items-center justify-center rounded-md bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] text-white shadow-xs group-hover:scale-105 transition-transform",children:a.jsx(cd, {
                  className:"w-3 h-3 stroke-[3]"
                })
              })]
            }),a.jsxs("button", {
              type:"button",onClick:ae,title:e("header.accountTooltip"),className:et("h-8 flex items-center gap-2 px-2 rounded-lg transition-colors cursor-pointer",t.pathname==="/account"?"text-primary":"text-text hover:bg-surface"),children:[a.jsxs("div", {
                className:"relative",children:[a.jsx("div", {
                  className:"w-6 h-6 rounded-md bg-primary/15 text-primary flex items-center justify-center font-bold text-xs",children:L.charAt(0).toUpperCase()
                }),a.jsx("span", {
                  className:"absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success border-2 border-background"
                })]
              }),a.jsx("span", {
                className:"hidden lg:block text-xs font-medium max-w-[80px] truncate",children:L
              })]
            })]
          })]
        })
      }),a.jsx("main", {
        className:"flex-1 w-full px-4 md:px-6 py-5 md:py-6",children:a.jsx(tE, {
          
        })
      }),a.jsxs("footer", {
        className:"w-full px-4 md:px-6 py-3 border-t border-border/40 text-xs text-text-muted",children:["© 2026 ",e("app.title")," v",tA.version]
      }),a.jsx(wv, {
        isOpen:f,onClose:H
      }),a.jsx(v7, {
        
      })]
    })]
  }):a.jsx(qu, {
    to:"/login",replace:!0
  })
};
var $f= {
  exports: {
    
  }
  
},S7=$f.exports,hk;
function oA() {
  return hk||(hk=1,(function(e,t) {
    (function(n,s) {
      e.exports=s()
    })(S7,(function() {
      var n=1e3,s=6e4,i=36e5,l="millisecond",c="second",d="minute",f="hour",m="day",p="week",g="month",y="quarter",S="year",v="date",N="Invalid Date",j=/^(\d {
        4
      })[-/]?(\d {
        1,2
      })?[-/]?(\d {
        0,2
      })[Tt\s]*(\d {
        1,2
      })?:?(\d {
        1,2
      })?:?(\d {
        1,2
      })?[.:]?(\d+)?$/,_=/\[([^\]]+)]|YYYY|YY|M {
        1,4
      }
      |D {
        1,2
      }
      |d {
        1,4
      }
      |H {
        1,2
      }
      |h {
        1,2
      }
      |a|A|m {
        1,2
      }
      |s {
        1,2
      }
      |Z {
        1,2
      }
      |SSS/g,k= {
        name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(K) {
          var V=["th","st","nd","rd"],E=K%100;
          return"["+K+(V[(E-20)%10]||V[E]||V[0])+"]"
        }
        
      },C=function(K,V,E) {
        var F=String(K);
        return!F||F.length>=V?K:""+Array(V+1-F.length).join(E)+K
      },A= {
        s:C,z:function(K) {
          var V=-K.utcOffset(),E=Math.abs(V),F=Math.floor(E/60),P=E%60;
          return(V<=0?"+":"-")+C(F,2,"0")+":"+C(P,2,"0")
        },m:function K(V,E) {
          if(V.date()<E.date())return-K(E,V);
          var F=12*(E.year()-V.year())+(E.month()-V.month()),P=V.clone().add(F,g),Y=E-P<0,q=V.clone().add(F+(Y?-1:1),g);
          return+(-(F+(E-P)/(Y?P-q:q-P))||0)
        },a:function(K) {
          return K<0?Math.ceil(K)||0:Math.floor(K)
        },p:function(K) {
          return {
            M:g,y:S,w:p,d:m,D:v,h:f,m:d,s:c,ms:l,Q:y
          }
          [K]||String(K||"").toLowerCase().replace(/s$/,"")
        },u:function(K) {
          return K===void 0
        }
        
      },U="en",B= {
        
      };
      B[U]=k;
      var R="$isDayjsObject",L=function(K) {
        return K instanceof ae||!(!K||!K[R])
      },$=function K(V,E,F) {
        var P;
        if(!V)return U;
        if(typeof V=="string") {
          var Y=V.toLowerCase();
          B[Y]&&(P=Y),E&&(B[Y]=E,P=Y);
          var q=V.split("-");
          if(!P&&q.length>1)return K(q[0])
        }
        else {
          var D=V.name;
          B[D]=V,P=D
        }
        return!F&&P&&(U=P),P||!F&&U
      },M=function(K,V) {
        if(L(K))return K.clone();
        var E=typeof V=="object"?V: {
          
        };
        return E.date=K,E.args=arguments,new ae(E)
      },H=A;
      H.l=$,H.i=L,H.w=function(K,V) {
        return M(K, {
          locale:V.$L,utc:V.$u,x:V.$x,$offset:V.$offset
        })
      };
      var ae=(function() {
        function K(E) {
          this.$L=$(E.locale,null,!0),this.parse(E),this.$x=this.$x||E.x|| {
            
          },this[R]=!0
        }
        var V=K.prototype;
        return V.parse=function(E) {
          this.$d=(function(F) {
            var P=F.date,Y=F.utc;
            if(P===null)return new Date(NaN);
            if(H.u(P))return new Date;
            if(P instanceof Date)return new Date(P);
            if(typeof P=="string"&&!/Z$/i.test(P)) {
              var q=P.match(j);
              if(q) {
                var D=q[2]-1||0,X=(q[7]||"0").substring(0,3);
                return Y?new Date(Date.UTC(q[1],D,q[3]||1,q[4]||0,q[5]||0,q[6]||0,X)):new Date(q[1],D,q[3]||1,q[4]||0,q[5]||0,q[6]||0,X)
              }
              
            }
            return new Date(P)
          })(E),this.init()
        },V.init=function() {
          var E=this.$d;
          this.$y=E.getFullYear(),this.$M=E.getMonth(),this.$D=E.getDate(),this.$W=E.getDay(),this.$H=E.getHours(),this.$m=E.getMinutes(),this.$s=E.getSeconds(),this.$ms=E.getMilliseconds()
        },V.$utils=function() {
          return H
        },V.isValid=function() {
          return this.$d.toString()!==N
        },V.isSame=function(E,F) {
          var P=M(E);
          return this.startOf(F)<=P&&P<=this.endOf(F)
        },V.isAfter=function(E,F) {
          return M(E)<this.startOf(F)
        },V.isBefore=function(E,F) {
          return this.endOf(F)<M(E)
        },V.$g=function(E,F,P) {
          return H.u(E)?this[F]:this.set(P,E)
        },V.unix=function() {
          return Math.floor(this.valueOf()/1e3)
        },V.valueOf=function() {
          return this.$d.getTime()
        },V.startOf=function(E,F) {
          var P=this,Y=!!H.u(F)||F,q=H.p(E),D=function(Te,Ve) {
            var le=H.w(P.$u?Date.UTC(P.$y,Ve,Te):new Date(P.$y,Ve,Te),P);
            return Y?le:le.endOf(m)
          },X=function(Te,Ve) {
            return H.w(P.toDate()[Te].apply(P.toDate("s"),(Y?[0,0,0,0]:[23,59,59,999]).slice(Ve)),P)
          },fe=this.$W,ue=this.$M,he=this.$D,ve="set"+(this.$u?"UTC":"");
          switch(q) {
            case S:return Y?D(1,0):D(31,11);
            case g:return Y?D(1,ue):D(0,ue+1);
            case p:var be=this.$locale().weekStart||0,Ae=(fe<be?fe+7:fe)-be;
            return D(Y?he-Ae:he+(6-Ae),ue);
            case m:case v:return X(ve+"Hours",0);
            case f:return X(ve+"Minutes",1);
            case d:return X(ve+"Seconds",2);
            case c:return X(ve+"Milliseconds",3);
            default:return this.clone()
          }
          
        },V.endOf=function(E) {
          return this.startOf(E,!1)
        },V.$set=function(E,F) {
          var P,Y=H.p(E),q="set"+(this.$u?"UTC":""),D=(P= {
            
          },P[m]=q+"Date",P[v]=q+"Date",P[g]=q+"Month",P[S]=q+"FullYear",P[f]=q+"Hours",P[d]=q+"Minutes",P[c]=q+"Seconds",P[l]=q+"Milliseconds",P)[Y],X=Y===m?this.$D+(F-this.$W):F;
          if(Y===g||Y===S) {
            var fe=this.clone().set(v,1);
            fe.$d[D](X),fe.init(),this.$d=fe.set(v,Math.min(this.$D,fe.daysInMonth())).$d
          }
          else D&&this.$d[D](X);
          return this.init(),this
        },V.set=function(E,F) {
          return this.clone().$set(E,F)
        },V.get=function(E) {
          return this[H.p(E)]()
        },V.add=function(E,F) {
          var P,Y=this;
          E=Number(E);
          var q=H.p(F),D=function(ue) {
            var he=M(Y);
            return H.w(he.date(he.date()+Math.round(ue*E)),Y)
          };
          if(q===g)return this.set(g,this.$M+E);
          if(q===S)return this.set(S,this.$y+E);
          if(q===m)return D(1);
          if(q===p)return D(7);
          var X=(P= {
            
          },P[d]=s,P[f]=i,P[c]=n,P)[q]||1,fe=this.$d.getTime()+E*X;
          return H.w(fe,this)
        },V.subtract=function(E,F) {
          return this.add(-1*E,F)
        },V.format=function(E) {
          var F=this,P=this.$locale();
          if(!this.isValid())return P.invalidDate||N;
          var Y=E||"YYYY-MM-DDTHH:mm:ssZ",q=H.z(this),D=this.$H,X=this.$m,fe=this.$M,ue=P.weekdays,he=P.months,ve=P.meridiem,be=function(Ve,le,oe,je) {
            return Ve&&(Ve[le]||Ve(F,Y))||oe[le].slice(0,je)
          },Ae=function(Ve) {
            return H.s(D%12||12,Ve,"0")
          },Te=ve||function(Ve,le,oe) {
            var je=Ve<12?"AM":"PM";
            return oe?je.toLowerCase():je
          };
          return Y.replace(_,(function(Ve,le) {
            return le||(function(oe) {
              switch(oe) {
                case"YY":return String(F.$y).slice(-2);
                case"YYYY":return H.s(F.$y,4,"0");
                case"M":return fe+1;
                case"MM":return H.s(fe+1,2,"0");
                case"MMM":return be(P.monthsShort,fe,he,3);
                case"MMMM":return be(he,fe);
                case"D":return F.$D;
                case"DD":return H.s(F.$D,2,"0");
                case"d":return String(F.$W);
                case"dd":return be(P.weekdaysMin,F.$W,ue,2);
                case"ddd":return be(P.weekdaysShort,F.$W,ue,3);
                case"dddd":return ue[F.$W];
                case"H":return String(D);
                case"HH":return H.s(D,2,"0");
                case"h":return Ae(1);
                case"hh":return Ae(2);
                case"a":return Te(D,X,!0);
                case"A":return Te(D,X,!1);
                case"m":return String(X);
                case"mm":return H.s(X,2,"0");
                case"s":return String(F.$s);
                case"ss":return H.s(F.$s,2,"0");
                case"SSS":return H.s(F.$ms,3,"0");
                case"Z":return q
              }
              return null
            })(Ve)||q.replace(":","")
          }))
        },V.utcOffset=function() {
          return 15*-Math.round(this.$d.getTimezoneOffset()/15)
        },V.diff=function(E,F,P) {
          var Y,q=this,D=H.p(F),X=M(E),fe=(X.utcOffset()-this.utcOffset())*s,ue=this-X,he=function() {
            return H.m(q,X)
          };
          switch(D) {
            case S:Y=he()/12;
            break;
            case g:Y=he();
            break;
            case y:Y=he()/3;
            break;
            case p:Y=(ue-fe)/6048e5;
            break;
            case m:Y=(ue-fe)/864e5;
            break;
            case f:Y=ue/i;
            break;
            case d:Y=ue/s;
            break;
            case c:Y=ue/n;
            break;
            default:Y=ue
          }
          return P?Y:H.a(Y)
        },V.daysInMonth=function() {
          return this.endOf(g).$D
        },V.$locale=function() {
          return B[this.$L]
        },V.locale=function(E,F) {
          if(!E)return this.$L;
          var P=this.clone(),Y=$(E,F,!0);
          return Y&&(P.$L=Y),P
        },V.clone=function() {
          return H.w(this.$d,this)
        },V.toDate=function() {
          return new Date(this.valueOf())
        },V.toJSON=function() {
          return this.isValid()?this.toISOString():null
        },V.toISOString=function() {
          return this.$d.toISOString()
        },V.toString=function() {
          return this.$d.toUTCString()
        },K
      })(),te=ae.prototype;
      return M.prototype=te,[["$ms",l],["$s",c],["$m",d],["$H",f],["$W",m],["$M",g],["$y",S],["$D",v]].forEach((function(K) {
        te[K[1]]=function(V) {
          return this.$g(V,K[0],K[1])
        }
        
      })),M.extend=function(K,V) {
        return K.$i||(K(V,ae,M),K.$i=!0),M
      },M.locale=$,M.isDayjs=L,M.unix=function(K) {
        return M(1e3*K)
      },M.en=B[U],M.Ls=B,M.p= {
        
      },M
    }))
  })($f)),$f.exports
}
var N7=oA();
const j7=ca(N7);
var Hf= {
  exports: {
    
  }
  
},k7=Hf.exports,fk;
function _7() {
  return fk||(fk=1,(function(e,t) {
    (function(n,s) {
      e.exports=s(oA())
    })(k7,(function(n) {
      function s(c) {
        return c&&typeof c=="object"&&"default"in c?c: {
          default:c
        }
        
      }
      var i=s(n),l= {
        name:"ja",weekdays:"日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日".split("_"),weekdaysShort:"日_月_火_水_木_金_土".split("_"),weekdaysMin:"日_月_火_水_木_金_土".split("_"),months:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),ordinal:function(c) {
          return c+"日"
        },formats: {
          LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日 HH:mm",LLLL:"YYYY年M月D日 dddd HH:mm",l:"YYYY/MM/DD",ll:"YYYY年M月D日",lll:"YYYY年M月D日 HH:mm",llll:"YYYY年M月D日(ddd) HH:mm"
        },meridiem:function(c) {
          return c<12?"午前":"午後"
        },relativeTime: {
          future:"%s後",past:"%s前",s:"数秒",m:"1分",mm:"%d分",h:"1時間",hh:"%d時間",d:"1日",dd:"%d日",M:"1ヶ月",MM:"%dヶ月",y:"1年",yy:"%d年"
        }
        
      };
      return i.default.locale(l,null,!0),l
    }))
  })(Hf)),Hf.exports
}
_7();
var qf= {
  exports: {
    
  }
  
},T7=qf.exports,mk;
function E7() {
  return mk||(mk=1,(function(e,t) {
    (function(n,s) {
      e.exports=s()
    })(T7,(function() {
      return function(n,s,i) {
        s.prototype.isBetween=function(l,c,d,f) {
          var m=i(l),p=i(c),g=(f=f||"()")[0]==="(",y=f[1]===")";
          return(g?this.isAfter(m,d):!this.isBefore(m,d))&&(y?this.isBefore(p,d):!this.isAfter(p,d))||(g?this.isBefore(m,d):!this.isAfter(m,d))&&(y?this.isAfter(p,d):!this.isBefore(p,d))
        }
        
      }
      
    }))
  })(qf)),qf.exports
}
var C7=E7();
const A7=ca(C7);
var Gf= {
  exports: {
    
  }
  
},O7=Gf.exports,pk;
function R7() {
  return pk||(pk=1,(function(e,t) {
    (function(n,s) {
      e.exports=s()
    })(O7,(function() {
      return function(n,s) {
        s.prototype.isSameOrAfter=function(i,l) {
          return this.isSame(i,l)||this.isAfter(i,l)
        }
        
      }
      
    }))
  })(Gf)),Gf.exports
}
var D7=R7();
const M7=ca(D7);
var Kf= {
  exports: {
    
  }
  
},L7=Kf.exports,gk;
function P7() {
  return gk||(gk=1,(function(e,t) {
    (function(n,s) {
      e.exports=s()
    })(L7,(function() {
      return function(n,s) {
        s.prototype.isSameOrBefore=function(i,l) {
          return this.isSame(i,l)||this.isBefore(i,l)
        }
        
      }
      
    }))
  })(Kf)),Kf.exports
}
var z7=P7();
const F7=ca(z7);
var Wf= {
  exports: {
    
  }
  
},I7=Wf.exports,xk;
function B7() {
  return xk||(xk=1,(function(e,t) {
    (function(n,s) {
      e.exports=s()
    })(I7,(function() {
      return function(n,s,i) {
        var l=s.prototype,c=function(g) {
          return g&&(g.indexOf?g:g.s)
        },d=function(g,y,S,v,N) {
          var j=g.name?g:g.$locale(),_=c(j[y]),k=c(j[S]),C=_||k.map((function(U) {
            return U.slice(0,v)
          }));
          if(!N)return C;
          var A=j.weekStart;
          return C.map((function(U,B) {
            return C[(B+(A||0))%7]
          }))
        },f=function() {
          return i.Ls[i.locale()]
        },m=function(g,y) {
          return g.formats[y]||(function(S) {
            return S.replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(v,N,j) {
              return N||j.slice(1)
            }))
          })(g.formats[y.toUpperCase()])
        },p=function() {
          var g=this;
          return {
            months:function(y) {
              return y?y.format("MMMM"):d(g,"months")
            },monthsShort:function(y) {
              return y?y.format("MMM"):d(g,"monthsShort","months",3)
            },firstDayOfWeek:function() {
              return g.$locale().weekStart||0
            },weekdays:function(y) {
              return y?y.format("dddd"):d(g,"weekdays")
            },weekdaysMin:function(y) {
              return y?y.format("dd"):d(g,"weekdaysMin","weekdays",2)
            },weekdaysShort:function(y) {
              return y?y.format("ddd"):d(g,"weekdaysShort","weekdays",3)
            },longDateFormat:function(y) {
              return m(g.$locale(),y)
            },meridiem:this.$locale().meridiem,ordinal:this.$locale().ordinal
          }
          
        };
        l.localeData=function() {
          return p.bind(this)()
        },i.localeData=function() {
          var g=f();
          return {
            firstDayOfWeek:function() {
              return g.weekStart||0
            },weekdays:function() {
              return i.weekdays()
            },weekdaysShort:function() {
              return i.weekdaysShort()
            },weekdaysMin:function() {
              return i.weekdaysMin()
            },months:function() {
              return i.months()
            },monthsShort:function() {
              return i.monthsShort()
            },longDateFormat:function(y) {
              return m(g,y)
            },meridiem:g.meridiem,ordinal:g.ordinal
          }
          
        },i.months=function() {
          return d(f(),"months")
        },i.monthsShort=function() {
          return d(f(),"monthsShort","months",3)
        },i.weekdays=function(g) {
          return d(f(),"weekdays",null,null,g)
        },i.weekdaysShort=function(g) {
          return d(f(),"weekdaysShort","weekdays",3,g)
        },i.weekdaysMin=function(g) {
          return d(f(),"weekdaysMin","weekdays",2,g)
        }
        
      }
      
    }))
  })(Wf)),Wf.exports
}
var U7=B7();
const V7=ca(U7);
var Yf= {
  exports: {
    
  }
  
},$7=Yf.exports,bk;
function H7() {
  return bk||(bk=1,(function(e,t) {
    (function(n,s) {
      e.exports=s()
    })($7,(function() {
      return function(n,s,i) {
        var l=function(c,d) {
          if(!d||!d.length||d.length===1&&!d[0]||d.length===1&&Array.isArray(d[0])&&!d[0].length)return null;
          var f;
          d.length===1&&d[0].length>0&&(d=d[0]),f=(d=d.filter((function(p) {
            return p
          })))[0];
          for(var m=1;
          m<d.length;
          m+=1)d[m].isValid()&&!d[m][c](f)||(f=d[m]);
          return f
        };
        i.max=function() {
          var c=[].slice.call(arguments,0);
          return l("isAfter",c)
        },i.min=function() {
          var c=[].slice.call(arguments,0);
          return l("isBefore",c)
        }
        
      }
      
    }))
  })(Yf)),Yf.exports
}
var q7=H7();
const G7=ca(q7);
var Zf= {
  exports: {
    
  }
  
},K7=Zf.exports,yk;
function W7() {
  return yk||(yk=1,(function(e,t) {
    (function(n,s) {
      e.exports=s()
    })(K7,(function() {
      return function(n,s) {
        s.prototype.weekday=function(i) {
          var l=this.$locale().weekStart||0,c=this.$W,d=(c<l?c+7:c)-l;
          return this.$utils().u(i)?d:this.subtract(d,"day").add(i,"day")
        }
        
      }
      
    }))
  })(Zf)),Zf.exports
}
var Y7=W7();
const Z7=ca(Y7),mi=j7;
mi.extend(Z7);
mi.extend(V7);
mi.extend(A7);
mi.extend(M7);
mi.extend(F7);
mi.extend(G7);
const X7=()=> {
  const {
    t:e
  }
  =Pt(),t=ss(),n=Yn(p=>p.user),[s,i]=w.useState(!1),l=w.useMemo(()=>n?.createdAt?mi(n.createdAt).format("DD/MM/YYYY HH:mm"):e("accountScreen.notUpdated"),[n?.createdAt,e]),c=w.useMemo(()=>n?.lastLoginAt?mi(n.lastLoginAt).format("DD/MM/YYYY HH:mm"):e("accountScreen.notUpdated"),[n?.lastLoginAt,e]),d=w.useCallback(()=> {
    t("/orders")
  },[t]),f=w.useCallback(()=> {
    Be.info(e("common.comingSoon"))
  },[e]),m=w.useCallback(()=> {
    Be.info(e("common.comingSoon"))
  },[e]);
  return a.jsxs("div", {
    className:"w-full flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700",children:[a.jsxs("div", {
      className:"relative w-full rounded-3xl bg-gradient-to-r from-primary/15 via-card to-accent/15 border border-border/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl overflow-hidden",children:[a.jsx("div", {
        className:"absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"
      }),a.jsx("div", {
        className:"absolute -bottom-12 -left-12 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none"
      }),a.jsxs("div", {
        className:"relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6",children:[a.jsxs("div", {
          className:"flex flex-col md:flex-row items-center gap-5 text-center md:text-left",children:[a.jsxs("div", {
            className:"relative",children:[a.jsx("div", {
              className:"w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary/15 border-2 border-primary/30 text-primary flex items-center justify-center shadow-lg",children:a.jsx(ui, {
                className:"w-10 h-10 sm:w-12 sm:h-12"
              })
            }),a.jsx("span", {
              className:"absolute bottom-0 right-0 w-5 h-5 rounded-full bg-success border-2 border-card shadow-xs",title:e("accountScreen.active")
            })]
          }),a.jsxs("div", {
            children:[a.jsxs("div", {
              className:"flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5",children:[a.jsx("h1", {
                className:"text-2xl sm:text-3xl font-black tracking-tight text-text",children:n?.displayName||"User"
              }),a.jsx("span", {
                className:"text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30",children:n?.roleType||"USER"
              })]
            }),a.jsxs("p", {
              className:"text-xs sm:text-sm text-text-muted font-medium flex items-center justify-center md:justify-start gap-2",children:[a.jsx(el, {
                className:"w-4 h-4 text-primary shrink-0"
              }),a.jsx("span", {
                children:n?.email||"N/A"
              })]
            }),a.jsx("p", {
              className:"text-xs text-text-muted/80 font-medium mt-1",children:e("accountScreen.subtitle")
            })]
          })]
        }),a.jsxs("div", {
          className:"flex flex-wrap items-center gap-3 shrink-0",children:[a.jsxs(Ue, {
            type:"button",onClick:d,className:"px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] text-white font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,27,112,0.4),0_0_8px_rgba(255,184,0,0.25)] hover:scale-105 active:scale-95",children:[a.jsx(V2, {
              className:"w-4 h-4"
            }),a.jsx("span", {
              children:e("accountScreen.purchasedOrders")
            })]
          }),a.jsxs(Ue, {
            type:"button",onClick:f,className:"px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-text font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95",children:[a.jsx(v9, {
              className:"w-4 h-4 text-primary"
            }),a.jsx("span", {
              children:e("accountScreen.personalInfo")
            })]
          }),a.jsxs(Ue, {
            type:"button",onClick:m,className:"px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-text font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95",children:[a.jsx(aa, {
              className:"w-4 h-4 text-primary"
            }),a.jsx("span", {
              children:e("accountScreen.changePassword")
            })]
          })]
        })]
      })]
    }),a.jsxs("div", {
      className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full",children:[a.jsxs("div", {
        onClick:d,className:"p-4 rounded-2xl bg-gradient-to-br from-primary/15 via-card/80 to-card border border-primary/30 hover:border-primary/60 backdrop-blur-md flex items-center justify-between shadow-md cursor-pointer transition-all group hover:-translate-y-0.5 col-span-2 sm:col-span-1",children:[a.jsxs("div", {
          className:"flex items-center gap-3 min-w-0",children:[a.jsx("div", {
            className:"p-3 rounded-xl bg-gradient-to-tr from-[#FF1B70] to-[#FFB800] text-white shadow-xs shrink-0 group-hover:scale-110 transition-transform",children:a.jsx(V2, {
              className:"w-5 h-5"
            })
          }),a.jsxs("div", {
            className:"min-w-0",children:[a.jsx("div", {
              className:"text-xs sm:text-sm font-black text-text group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FF1B70] group-hover:to-[#FFB800] transition-all truncate",children:e("accountScreen.purchasedOrders")
            }),a.jsx("div", {
              className:"text-[10px] font-semibold text-text-muted truncate",children:e("accountScreen.viewOrderHistory")
            })]
          })]
        }),a.jsx(Ca, {
          className:"w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-1"
        })]
      }),a.jsxs("div", {
        className:"p-4 rounded-2xl bg-card/70 border border-border/60 backdrop-blur-md flex items-center gap-3.5 shadow-sm",children:[a.jsx("div", {
          className:"p-3 rounded-xl bg-primary/15 text-primary border border-primary/20 shrink-0",children:a.jsx(Un, {
            className:"w-5 h-5"
          })
        }),a.jsxs("div", {
          children:[a.jsx("div", {
            className:"text-lg sm:text-xl font-extrabold text-text",children:"0"
          }),a.jsx("div", {
            className:"text-[11px] font-semibold text-text-muted",children:e("accountScreen.rentedGames")
          })]
        })]
      }),a.jsxs("div", {
        className:"p-4 rounded-2xl bg-card/70 border border-border/60 backdrop-blur-md flex items-center gap-3.5 shadow-sm",children:[a.jsx("div", {
          className:"p-3 rounded-xl bg-accent/15 text-accent border border-accent/20 shrink-0",children:a.jsx(Aa, {
            className:"w-5 h-5"
          })
        }),a.jsxs("div", {
          children:[a.jsx("div", {
            className:"text-lg sm:text-xl font-extrabold text-text",children:"0"
          }),a.jsx("div", {
            className:"text-[11px] font-semibold text-text-muted",children:e("accountScreen.activeRentals")
          })]
        })]
      }),a.jsxs("div", {
        onClick:()=>i(!0),className:"p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card/80 to-card border border-emerald-500/30 hover:border-emerald-400 backdrop-blur-md flex items-center justify-between shadow-sm cursor-pointer transition-all group hover:-translate-y-0.5",children:[a.jsxs("div", {
          className:"flex items-center gap-3 min-w-0",children:[a.jsx("div", {
            className:"p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform",children:a.jsx(Ho, {
              className:"w-5 h-5"
            })
          }),a.jsxs("div", {
            className:"min-w-0",children:[a.jsx("div", {
              className:"text-lg sm:text-xl font-extrabold text-emerald-400 truncate",children:a.jsx(Fs, {
                locales:"vi-VN",value:n?.wallet?.balance??0,format: {
                  style:"currency",currency:"VND",minimumFractionDigits:0
                }
                
              })
            }),a.jsx("div", {
              className:"text-[11px] font-semibold text-text-muted truncate",children:e("accountScreen.walletBalance")
            })]
          })]
        }),a.jsx("div", {
          className:"p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-black transition-all shrink-0",children:a.jsx(cd, {
            className:"w-4 h-4"
          })
        })]
      }),a.jsxs("div", {
        className:"p-4 rounded-2xl bg-card/70 border border-border/60 backdrop-blur-md flex items-center gap-3.5 shadow-sm",children:[a.jsx("div", {
          className:"p-3 rounded-xl bg-success/15 text-success border border-success/20 shrink-0",children:a.jsx(js, {
            className:"w-5 h-5"
          })
        }),a.jsxs("div", {
          children:[a.jsx("div", {
            className:"text-sm sm:text-base font-extrabold text-success",children:e("accountScreen.active")
          }),a.jsx("div", {
            className:"text-[11px] font-semibold text-text-muted",children:e("accountScreen.status")
          })]
        })]
      })]
    }),a.jsxs("div", {
      className:"grid grid-cols-1 lg:grid-cols-2 gap-6 w-full flex-1",children:[a.jsx("div", {
        className:"rounded-3xl bg-card/70 border border-border/60 p-6 shadow-lg backdrop-blur-xl flex flex-col justify-between",children:a.jsxs("div", {
          children:[a.jsxs("div", {
            className:"flex items-center gap-2.5 mb-5 pb-3 border-b border-border/40",children:[a.jsx(ui, {
              className:"w-5 h-5 text-primary"
            }),a.jsx("h2", {
              className:"text-lg font-extrabold tracking-tight text-text",children:e("accountScreen.personalInfo")
            })]
          }),a.jsxs("div", {
            className:"space-y-4",children:[a.jsxs("div", {
              className:"flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-surface/50 border border-border/40 gap-1",children:[a.jsxs("div", {
                className:"flex items-center gap-2 text-xs font-semibold text-text-muted",children:[a.jsx(ui, {
                  className:"w-4 h-4 text-primary/70"
                }),a.jsx("span", {
                  children:e("accountScreen.displayName")
                })]
              }),a.jsx("span", {
                className:"text-sm font-bold text-text",children:n?.displayName||"N/A"
              })]
            }),a.jsxs("div", {
              className:"flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-surface/50 border border-border/40 gap-1",children:[a.jsxs("div", {
                className:"flex items-center gap-2 text-xs font-semibold text-text-muted",children:[a.jsx(el, {
                  className:"w-4 h-4 text-primary/70"
                }),a.jsx("span", {
                  children:e("accountScreen.email")
                })]
              }),a.jsx("span", {
                className:"text-sm font-bold text-text font-mono",children:n?.email||"N/A"
              })]
            }),a.jsxs("div", {
              className:"flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-surface/50 border border-border/40 gap-1",children:[a.jsxs("div", {
                className:"flex items-center gap-2 text-xs font-semibold text-text-muted",children:[a.jsx(lp, {
                  className:"w-4 h-4 text-primary/70"
                }),a.jsx("span", {
                  children:e("accountScreen.phone")
                })]
              }),a.jsx("span", {
                className:"text-sm font-bold text-text",children:n?.phone||e("accountScreen.notUpdated")
              })]
            })]
          })]
        })
      }),a.jsx("div", {
        className:"rounded-3xl bg-card/70 border border-border/60 p-6 shadow-lg backdrop-blur-xl flex flex-col justify-between",children:a.jsxs("div", {
          children:[a.jsxs("div", {
            className:"flex items-center gap-2.5 mb-5 pb-3 border-b border-border/40",children:[a.jsx(js, {
              className:"w-5 h-5 text-accent"
            }),a.jsx("h2", {
              className:"text-lg font-extrabold tracking-tight text-text",children:e("accountScreen.securityTitle")
            })]
          }),a.jsxs("div", {
            className:"space-y-4",children:[a.jsxs("div", {
              className:"flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-surface/50 border border-border/40 gap-1",children:[a.jsxs("div", {
                className:"flex items-center gap-2 text-xs font-semibold text-text-muted",children:[a.jsx(eB, {
                  className:"w-4 h-4 text-accent/70"
                }),a.jsx("span", {
                  children:e("accountScreen.joinedDate")
                })]
              }),a.jsx("span", {
                className:"text-xs font-bold text-text",children:l
              })]
            }),a.jsxs("div", {
              className:"flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-surface/50 border border-border/40 gap-1",children:[a.jsxs("div", {
                className:"flex items-center gap-2 text-xs font-semibold text-text-muted",children:[a.jsx(gr, {
                  className:"w-4 h-4 text-accent/70"
                }),a.jsx("span", {
                  children:e("accountScreen.lastLogin")
                })]
              }),a.jsx("span", {
                className:"text-xs font-bold text-text",children:c
              })]
            }),a.jsxs("div", {
              className:"flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-surface/50 border border-border/40 gap-1",children:[a.jsxs("div", {
                className:"flex items-center gap-2 text-xs font-semibold text-text-muted",children:[a.jsx(aa, {
                  className:"w-4 h-4 text-accent/70"
                }),a.jsx("span", {
                  children:e("accountScreen.changePassword")
                })]
              }),a.jsx("span", {
                className:"text-xs font-bold text-text font-mono",children:"••••••••••••"
              })]
            })]
          })]
        })
      })]
    }),a.jsx(wv, {
      isOpen:s,onClose:()=>i(!1)
    })]
  })
},Hy=new Set,Rs=new WeakMap,nl=new WeakMap,br=new WeakMap,ud=new WeakMap,ub=new WeakMap,Fu=new WeakMap,qo=new WeakMap,Qi=new WeakMap,Zl=new WeakSet;
let Js,Sv=0,Nv=0;
const li="__aa_tgt",dd="__aa_del",Cm="__aa_new",lA=e=> {
  const t=t$(e);
  t&&t.forEach(n=>n$(n))
},Q7=e=> {
  e.forEach(t=> {
    t.target===Js&&J7(),Rs.has(t.target)&&il(t.target)
  })
};
function cA(e) {
  const t=e.getBoundingClientRect(),n=Js?.clientWidth||0,s=Js?.clientHeight||0;
  return t.bottom<0||t.top>s||t.right<0||t.left>n
}
function jv(e) {
  const t=ud.get(e);
  t?.disconnect();
  let n=Rs.get(e),s=0;
  const i=5;
  n||(n=hc(e),Rs.set(e,n));
  const {
    offsetWidth:l,offsetHeight:c
  }
  =Js,f=[n.top-i,l-(n.left+i+n.width),c-(n.top+i+n.height),n.left-i].map(p=>`${-1*Math.floor(p)}px`).join(" "),m=new IntersectionObserver(()=> {
    ++s>1&&il(e)
  }, {
    root:Js,threshold:1,rootMargin:f
  });
  m.observe(e),ud.set(e,m)
}
function il(e,t=!0) {
  clearTimeout(Qi.get(e));
  const n=cp(e),s=t?hd(n)?500:n.duration:0;
  Qi.set(e,setTimeout(async()=> {
    const i=br.get(e);
    try {
      await i?.finished,Rs.set(e,hc(e)),jv(e)
    }
    catch {
      
    }
    
  },s))
}
function J7() {
  clearTimeout(Qi.get(Js)),Qi.set(Js,setTimeout(()=> {
    Hy.forEach(e=>Xf(e,t=>uA(()=>il(t))))
  },100))
}
function e$(e) {
  setTimeout(()=> {
    Fu.set(e,setInterval(()=>uA(il.bind(null,e)),2e3))
  },Math.round(2e3*Math.random()))
}
function uA(e) {
  typeof requestIdleCallback=="function"?requestIdleCallback(()=>e()):requestAnimationFrame(()=>e())
}
let ai;
const dA=typeof window<"u"&&"ResizeObserver"in window;
dA&&(Js=document.documentElement,new MutationObserver(lA),ai=new ResizeObserver(Q7),window.addEventListener("scroll",()=> {
  Nv=window.scrollY,Sv=window.scrollX
}),ai.observe(Js));
function t$(e) {
  return e.reduce((s,i)=>[...s,...Array.from(i.addedNodes),...Array.from(i.removedNodes)],[]).every(s=>s.nodeName==="#comment")?!1:e.reduce((s,i)=> {
    if(s===!1)return!1;
    if(i.target instanceof Element) {
      if(db(i.target),!s.has(i.target)) {
        s.add(i.target);
        for(let l=0;
        l<i.target.children.length;
        l++) {
          const c=i.target.children.item(l);
          if(c) {
            if(dd in c)return!1;
            db(i.target,c),s.add(c)
          }
          
        }
        
      }
      if(i.removedNodes.length)for(let l=0;
      l<i.removedNodes.length;
      l++) {
        const c=i.removedNodes[l];
        if(dd in c)return!1;
        c instanceof Element&&(s.add(c),db(i.target,c),nl.set(c,[i.previousSibling,i.nextSibling]))
      }
      
    }
    return s
  },new Set)
}
function db(e,t) {
  !t&&!(li in e)?Object.defineProperty(e,li, {
    value:e
  }):t&&!(li in t)&&Object.defineProperty(t,li, {
    value:e
  })
}
function n$(e) {
  var t,n;
  const s=e.isConnected,i=Rs.has(e);
  s&&nl.has(e)&&nl.delete(e),((t=br.get(e))===null||t===void 0?void 0:t.playState)!=="finished"&&((n=br.get(e))===null||n===void 0||n.cancel()),Cm in e?vk(e):i&&s?r$(e):i&&!s?a$(e):vk(e)
}
function va(e) {
  return Number(e.replace(/[^0-9.\-]/g,""))
}
function s$(e) {
  let t=e.parentElement;
  for(;
  t;
  ) {
    if(t.scrollLeft||t.scrollTop)return {
      x:t.scrollLeft,y:t.scrollTop
    };
    t=t.parentElement
  }
  return {
    x:0,y:0
  }
  
}
function hc(e) {
  const t=e.getBoundingClientRect(), {
    x:n,y:s
  }
  =s$(e);
  return {
    top:t.top+s,left:t.left+n,width:t.width,height:t.height
  }
  
}
function hA(e,t,n) {
  let s=t.width,i=t.height,l=n.width,c=n.height;
  const d=getComputedStyle(e);
  if(d.getPropertyValue("box-sizing")==="content-box") {
    const m=va(d.paddingTop)+va(d.paddingBottom)+va(d.borderTopWidth)+va(d.borderBottomWidth),p=va(d.paddingLeft)+va(d.paddingRight)+va(d.borderRightWidth)+va(d.borderLeftWidth);
    s-=p,l-=p,i-=m,c-=m
  }
  return[s,l,i,c].map(Math.round)
}
function cp(e) {
  return li in e&&qo.has(e[li])?qo.get(e[li]): {
    duration:250,easing:"ease-in-out"
  }
  
}
function fA(e) {
  if(li in e)return e[li]
}
function kv(e) {
  const t=fA(e);
  return t?Zl.has(t):!1
}
function Xf(e,...t) {
  t.forEach(n=>n(e,qo.has(e)));
  for(let n=0;
  n<e.children.length;
  n++) {
    const s=e.children.item(n);
    s&&t.forEach(i=>i(s,qo.has(s)))
  }
  
}
function _v(e) {
  return Array.isArray(e)?e:[e]
}
function hd(e) {
  return typeof e=="function"
}
function r$(e) {
  const t=Rs.get(e),n=hc(e);
  if(!kv(e))return Rs.set(e,n);
  if(cA(e)) {
    Rs.set(e,n),jv(e);
    return
  }
  let s;
  if(!t)return;
  const i=cp(e);
  if(typeof i!="function") {
    let l=t.left-n.left,c=t.top-n.top;
    const d=t.left+t.width-(n.left+n.width);
    t.top+t.height-(n.top+n.height)==0&&(c=0),d==0&&(l=0);
    const[m,p,g,y]=hA(e,t,n),S= {
      transform:`translate(${l}px, ${c}px)`
    },v= {
      transform:"translate(0, 0)"
    };
    m!==p&&(S.width=`${m}px`,v.width=`${p}px`),g!==y&&(S.height=`${g}px`,v.height=`${y}px`),s=e.animate([S,v], {
      duration:i.duration,easing:i.easing
    })
  }
  else {
    const[l]=_v(i(e,"remain",t,n));
    s=new Animation(l),s.play()
  }
  br.set(e,s),Rs.set(e,n),s.addEventListener("finish",il.bind(null,e,!1), {
    once:!0
  })
}
function vk(e) {
  Cm in e&&delete e[Cm];
  const t=hc(e);
  Rs.set(e,t);
  const n=cp(e);
  if(!kv(e))return;
  if(cA(e)) {
    jv(e);
    return
  }
  let s;
  if(typeof n!="function")s=e.animate([ {
    transform:"scale(.98)",opacity:0
  }, {
    transform:"scale(0.98)",opacity:0,offset:.5
  }, {
    transform:"scale(1)",opacity:1
  }
  ], {
    duration:n.duration*1.5,easing:"ease-in"
  });
  else {
    const[i]=_v(n(e,"add",t));
    s=new Animation(i),s.play()
  }
  br.set(e,s),s.addEventListener("finish",il.bind(null,e,!1), {
    once:!0
  })
}
function wk(e,t) {
  var n;
  e.remove(),Rs.delete(e),nl.delete(e),br.delete(e),(n=ud.get(e))===null||n===void 0||n.disconnect(),setTimeout(()=> {
    if(dd in e&&delete e[dd],Object.defineProperty(e,Cm, {
      value:!0,configurable:!0
    }),t&&e instanceof HTMLElement)for(const s in t)e.style[s]=""
  },0)
}
function a$(e) {
  var t;
  if(!nl.has(e)||!Rs.has(e))return;
  const[n,s]=nl.get(e);
  Object.defineProperty(e,dd, {
    value:!0,configurable:!0
  });
  const i=window.scrollX,l=window.scrollY;
  if(s&&s.parentNode&&s.parentNode instanceof Element?s.parentNode.insertBefore(e,s):n&&n.parentNode?n.parentNode.appendChild(e):(t=fA(e))===null||t===void 0||t.appendChild(e),!kv(e))return wk(e);
  const[c,d,f,m]=o$(e),p=cp(e),g=Rs.get(e);
  (i!==Sv||l!==Nv)&&i$(e,i,l,p);
  let y,S= {
    position:"absolute",top:`${c}px`,left:`${d}px`,width:`${f}px`,height:`${m}px`,margin:"0",pointerEvents:"none",transformOrigin:"center",zIndex:"100"
  };
  if(!hd(p))Object.assign(e.style,S),y=e.animate([ {
    transform:"scale(1)",opacity:1
  }, {
    transform:"scale(.98)",opacity:0
  }
  ], {
    duration:p.duration,easing:"ease-out"
  });
  else {
    const[v,N]=_v(p(e,"remove",g));
    N?.styleReset!==!1&&(S=N?.styleReset||S,Object.assign(e.style,S)),y=new Animation(v),y.play()
  }
  br.set(e,y),y.addEventListener("finish",()=>wk(e,S), {
    once:!0
  })
}
function i$(e,t,n,s) {
  const i=Sv-t,l=Nv-n,c=document.documentElement.style.scrollBehavior;
  if(getComputedStyle(Js).scrollBehavior==="smooth"&&(document.documentElement.style.scrollBehavior="auto"),window.scrollTo(window.scrollX+i,window.scrollY+l),!e.parentElement)return;
  const f=e.parentElement;
  let m=f.clientHeight,p=f.clientWidth;
  const g=performance.now();
  function y() {
    requestAnimationFrame(()=> {
      if(!hd(s)) {
        const S=m-f.clientHeight,v=p-f.clientWidth;
        g+s.duration>performance.now()?(window.scrollTo( {
          left:window.scrollX-v,top:window.scrollY-S
        }),m=f.clientHeight,p=f.clientWidth,y()):document.documentElement.style.scrollBehavior=c
      }
      
    })
  }
  y()
}
function o$(e) {
  var t;
  const n=Rs.get(e),[s,,i]=hA(e,n,hc(e));
  let l=e.parentElement;
  for(;
  l&&(getComputedStyle(l).position==="static"||l instanceof HTMLBodyElement);
  )l=l.parentElement;
  l||(l=document.body);
  const c=getComputedStyle(l),d=!br.has(e)||((t=br.get(e))===null||t===void 0?void 0:t.playState)==="finished"?hc(l):Rs.get(l),f=Math.round(n.top-d.top)-va(c.borderTopWidth),m=Math.round(n.left-d.left)-va(c.borderLeftWidth);
  return[f,m,s,i]
}
function mA(e,t= {
  
}) {
  if(dA&&ai&&!(window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!hd(t)&&!t.disrespectUserMotionPreference)) {
    Zl.add(e),getComputedStyle(e).position==="static"&&Object.assign(e.style, {
      position:"relative"
    }),Xf(e,il,e$,c=>ai?.observe(c)),hd(t)?qo.set(e,t):qo.set(e, {
      duration:250,easing:"ease-in-out",...t
    });
    const l=new MutationObserver(lA);
    l.observe(e, {
      childList:!0
    }),ub.set(e,l),Hy.add(e)
  }
  return Object.freeze( {
    parent:e,enable:()=> {
      Zl.add(e)
    },disable:()=> {
      Zl.delete(e),Xf(e,s=> {
        const i=br.get(s);
        try {
          i?.cancel()
        }
        catch {
          
        }
        br.delete(s);
        const l=Qi.get(s);
        l&&clearTimeout(l),Qi.delete(s);
        const c=Fu.get(s);
        c&&clearInterval(c),Fu.delete(s)
      })
    },isEnabled:()=>Zl.has(e),destroy:()=> {
      Zl.delete(e),Hy.delete(e),qo.delete(e);
      const s=ub.get(e);
      s?.disconnect(),ub.delete(e),Xf(e,i=> {
        ai?.unobserve(i);
        const l=br.get(i);
        try {
          l?.cancel()
        }
        catch {
          
        }
        br.delete(i);
        const c=ud.get(i);
        c?.disconnect(),ud.delete(i);
        const d=Fu.get(i);
        d&&clearInterval(d),Fu.delete(i);
        const f=Qi.get(i);
        f&&clearTimeout(f),Qi.delete(i),Rs.delete(i),nl.delete(i)
      })
    }
    
  })
}
const Am= {
  checkoutOrder:async e=> {
    const {
      data:t
    }
    =await bt.post("/orders/checkout",e);
    return t
  },getMyOrders:async e=> {
    try {
      const {
        data:t
      }
      =await bt.get("/orders/my-orders", {
        params:e
      });
      return t
    }
    catch(t) {
      return console.warn("Failed to fetch my orders API, falling back:",t),null
    }
    
  },getOrderById:async e=> {
    try {
      const {
        data:t
      }
      =await bt.get(`/orders/${e}`);
      return t?.data||t
    }
    catch(t) {
      return console.warn("Failed to fetch order detail API:",t),null
    }
    
  }
  
},pA=( {
  isOpen:e,onClose:t,product:n,selectedVariation:s,cartItems:i,totalPrice:l,onOpenTopup:c,onCheckoutSuccess:d
})=> {
  const f=!!i, {
    t:m
  }
  =Pt(),p=ss(),g=Yn(Ve=>Ve.user),y=Yn(Ve=>Ve.updateWalletBalance),[S,v]=w.useState("WALLET"),[N,j]=w.useState(!1),[_,k]=w.useState(!1),[C,A]=w.useState(null),[U,B]=w.useState(null),[R,L]=w.useState(!1),$=w.useRef(!1),M=w.useRef(!1),H=w.useRef(0),ae=w.useMemo(()=>g?.wallet?.balance??0,[g?.wallet?.balance]),te=w.useMemo(()=>ae>=l,[ae,l]),K=w.useMemo(()=>Math.max(0,l-ae),[l,ae]),[V,E]=w.useState(null),[F,P]=w.useState(!1),[Y,q]=w.useState(!1),D=!!V||Y,X=w.useCallback(async()=> {
    if(!f&&!n?.id||V||$.current)return;
    $.current=!0;
    const Ve=H.current;
    q(!0);
    const le=f?i.map(oe=>( {
      productId:oe.productId,variationId:oe.variantId,quantity:oe.quantity
    })):[ {
      productId:n.id,variationId:s?.id,quantity:1
    }
    ];
    try {
      const oe=await Am.checkoutOrder( {
        items:le,paymentMethod:"BANK_TRANSFER"
      });
      if(Ve!==H.current)return;
      if(oe&&oe.data&&oe.qrData) {
        const je=oe.data.orderCode||oe.data.code||"";
        E( {
          orderCode:je,qrData:oe.qrData
        }),B(je)
      }
      else $.current=!1
    }
    catch {
      if(Ve!==H.current)return;
      $.current=!1
    }
    finally {
      Ve===H.current&&q(!1)
    }
    
  },[f,n,s?.id,i,V,m]),fe=w.useCallback(Ve=> {
    Ve==="WALLET"&&D||(L(!1),v(Ve))
  },[D]);
  w.useEffect(()=> {
    e||(H.current+=1,$.current=!1,M.current=!1,j(!1),k(!1),B(null),A(null),v("WALLET"),L(!1),E(null),q(!1))
  },[e]);
  const ue=V?.orderCode;
  w.useEffect(()=> {
    if(!e||S!=="BANK_TRANSFER"||!ue)return;
    const Ve=oe=> {
      const je=oe.detail;
      !je||je.type!=="ORDER"||String(je.orderCode||"").toUpperCase()===ue.toUpperCase()&&(j(!1),k(!0),P(!1),B(je.orderCode||ue),Be.success(m("checkoutModal.paymentSuccessTitle")),Io(er.MY_ORDERS),Io(er.LIBRARY),d?.())
    },le=oe=> {
      const je=oe.detail;
      !je||je.type!=="ORDER"||String(je.orderCode||"").toUpperCase()===ue.toUpperCase()&&j(!0)
    };
    return window.addEventListener("payment:success",Ve),window.addEventListener("payment:processing",le),()=> {
      window.removeEventListener("payment:success",Ve),window.removeEventListener("payment:processing",le)
    }
    
  },[e,S,ue,m]);
  const he=w.useCallback((Ve,le,oe)=> {
    Ve&&(navigator.clipboard.writeText(Ve),A(le),Be.success(m("checkoutModal.copied", {
      label:oe
    })),setTimeout(()=> {
      A(null)
    },2e3))
  },[m]),ve=w.useCallback(async()=> {
    if(!(!f&&!n?.id)&&!(D||M.current)) {
      if(!te) {
        Be.error(m("checkoutModal.insufficientBalance", {
          amount:`${K.toLocaleString("vi-VN")} ₫`
        }));
        return
      }
      M.current=!0,j(!0);
      try {
        const Ve=f?i.map(oe=>( {
          productId:oe.productId,variationId:oe.variantId,quantity:oe.quantity
        })):[ {
          productId:n.id,variationId:s?.id,quantity:1
        }
        ],le=await Am.checkoutOrder( {
          items:Ve,paymentMethod:"WALLET"
        });
        if(le&&le.data) {
          const oe=Math.max(0,ae-l);
          y(oe);
          const je=le.data.orderCode||le.data.code||"";
          B(je),P(!1),k(!0),Be.success(m("checkoutModal.paymentSuccessTitle")),Io(er.MY_ORDERS),Io(er.LIBRARY),d?.()
        }
        
      }
      catch(Ve) {
        console.error("Wallet checkout error:",Ve),M.current=!1,L(!1)
      }
      finally {
        j(!1)
      }
      
    }
    
  },[f,n?.id,s?.id,i,D,te,K,ae,l,y,d,m]),be=w.useCallback(()=> {
    t(),p("/orders")
  },[t,p]),Ae=w.useCallback(()=> {
    t(),p("/library")
  },[t,p]);
  if(!e||!f&&!n)return null;
  const Te=f?i[0]?.product?.thumbnail?.url:s?.thumbnail?.url||n.thumbnail?.url;
  return a.jsxs("div", {
    className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",children:[a.jsxs("div", {
      className:"relative w-full max-w-2xl rounded-2xl bg-card border border-border overflow-hidden my-auto",children:[a.jsxs("div", {
        className:"relative z-10 flex items-center justify-between p-5 border-b border-border bg-surface",children:[a.jsxs("div", {
          className:"flex items-center gap-3",children:[a.jsx("div", {
            className:"p-2 rounded-lg bg-primary/10 text-primary border border-primary/20",children:a.jsx(lv, {
              className:"w-5 h-5"
            })
          }),a.jsxs("div", {
            children:[a.jsx("h2", {
              className:"text-base font-bold text-text tracking-wide",children:m(_?"checkoutModal.paymentSuccessTitle":"checkoutModal.title")
            }),a.jsx("p", {
              className:"text-xs text-text-muted font-medium",children:m(_?"checkoutModal.paymentSuccessDesc":"checkoutModal.subtitle")
            })]
          })]
        }),a.jsx("button", {
          type:"button",onClick:t,className:"p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer",children:a.jsx(Yt, {
            className:"w-5 h-5"
          })
        })]
      }),a.jsx("div", {
        className:"relative z-10 p-5 space-y-5",children:_?a.jsxs("div", {
          className:"py-6 flex flex-col items-center justify-center text-center space-y-4",children:[a.jsx("div", {
            className:"relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500",children:a.jsx(Sn, {
              className:"w-8 h-8"
            })
          }),a.jsxs("div", {
            className:"space-y-1",children:[a.jsx("h3", {
              className:"text-lg font-bold text-text",children:m("checkoutModal.paymentSuccessTitle")
            }),a.jsx("p", {
              className:"text-xs text-text-muted max-w-sm mx-auto",children:m("checkoutModal.paymentSuccessDesc")
            })]
          }),a.jsxs("div", {
            className:"w-full max-w-sm mx-auto p-4 rounded-xl bg-surface border border-border space-y-2 text-left text-xs",children:[a.jsxs("div", {
              className:"flex items-center justify-between text-text-muted",children:[a.jsx("span", {
                children:m("checkoutModal.orderCode")
              }),a.jsxs("span", {
                className:"font-semibold text-text",children:["#",U]
              })]
            }),a.jsxs("div", {
              className:"flex items-center justify-between text-text-muted",children:[a.jsxs("span", {
                children:[m("checkoutModal.productInfo"),":"]
              }),a.jsx("span", {
                className:"font-medium text-text truncate max-w-[200px]",children:f?m("checkoutModal.cartSummary", {
                  count:i.length
                }):n.title
              })]
            }),a.jsxs("div", {
              className:"flex items-center justify-between pt-2 border-t border-border text-text",children:[a.jsxs("span", {
                className:"font-semibold",children:[m("checkoutModal.totalAmount"),":"]
              }),a.jsxs("span", {
                className:"font-bold text-sm bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent",children:[l.toLocaleString("vi-VN")," ₫"]
              })]
            })]
          }),a.jsxs("div", {
            className:"pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm mx-auto",children:[a.jsxs(Ue, {
              type:"button",onClick:Ae,className:"w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer",children:[a.jsx(Un, {
                className:"w-4 h-4"
              }),a.jsx("span", {
                children:m("checkoutModal.goToLibrary")
              })]
            }),a.jsxs(Ue, {
              type:"button",variant:"outline",onClick:be,className:"w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5",children:[a.jsx("span", {
                children:m("checkoutModal.viewOrders")
              }),a.jsx(Ur, {
                className:"w-4 h-4"
              })]
            })]
          })]
        }):a.jsxs(a.Fragment, {
          children:[f?a.jsxs("div", {
            className:"p-3 rounded-xl bg-surface border border-border flex items-center gap-3",children:[a.jsx("div", {
              className:"p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0",children:a.jsx(tl, {
                className:"w-5 h-5"
              })
            }),a.jsxs("div", {
              className:"flex-1 min-w-0",children:[a.jsx("h4", {
                className:"text-sm font-semibold text-text",children:m("checkoutModal.cartSummary", {
                  count:i.length
                })
              }),a.jsxs("div", {
                className:"mt-1 flex items-baseline gap-1.5",children:[a.jsxs("span", {
                  className:"text-xs text-text-muted",children:[m("checkoutModal.totalAmount"),":"]
                }),a.jsxs("span", {
                  className:"text-sm font-bold bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent",children:[l.toLocaleString("vi-VN")," ₫"]
                })]
              })]
            })]
          }):a.jsxs("div", {
            className:"p-3 rounded-xl bg-surface border border-border flex items-center gap-3",children:[a.jsx("div", {
              className:"relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border bg-card",children:Te?a.jsx(fi, {
                src:Te,alt:n.title,className:"w-full h-full object-cover"
              }):a.jsx("div", {
                className:"w-full h-full flex items-center justify-center text-text-muted text-[10px]",children:"No img"
              })
            }),a.jsxs("div", {
              className:"flex-1 min-w-0",children:[a.jsx("h4", {
                className:"text-sm font-semibold text-text truncate",children:n.title
              }),s&&a.jsxs("p", {
                className:"text-[11px] text-text-muted truncate mt-0.5",children:[m("checkoutModal.variation"),": ",s.title]
              }),a.jsxs("div", {
                className:"mt-1 flex items-baseline gap-1.5",children:[a.jsxs("span", {
                  className:"text-xs text-text-muted",children:[m("checkoutModal.totalAmount"),":"]
                }),a.jsxs("span", {
                  className:"text-sm font-bold bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent",children:[l.toLocaleString("vi-VN")," ₫"]
                })]
              })]
            })]
          }),a.jsxs("div", {
            className:"space-y-3",children:[a.jsxs("label", {
              className:"text-xs font-semibold text-text flex items-center gap-1.5",children:[a.jsx(js, {
                className:"w-3.5 h-3.5 text-primary"
              }),a.jsx("span", {
                children:m("checkoutModal.paymentMethodTitle")
              })]
            }),a.jsxs("div", {
              className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[a.jsxs("button", {
                type:"button",onClick:()=>fe("WALLET"),disabled:D,title:D?m("checkoutModal.walletLockedByBank"):void 0,className:et("relative p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-3",S==="WALLET"?"bg-primary/5 border-primary":"bg-surface border-border hover:border-primary/50",D&&"opacity-50 cursor-not-allowed hover:border-border"),children:[a.jsxs("div", {
                  className:"flex items-start justify-between w-full",children:[a.jsxs("div", {
                    className:"flex items-center gap-2.5",children:[a.jsx("div", {
                      className:et("p-1.5 rounded-lg border transition-colors",S==="WALLET"?"bg-primary text-primary-foreground border-primary":"bg-surface-2 text-primary border-border"),children:a.jsx(Ho, {
                        className:"w-4 h-4"
                      })
                    }),a.jsxs("div", {
                      children:[a.jsx("div", {
                        className:"text-xs font-semibold text-text",children:m("checkoutModal.methodWallet")
                      }),a.jsx("div", {
                        className:"text-[10px] text-text-muted leading-tight mt-0.5",children:m("checkoutModal.methodWalletDesc")
                      })]
                    })]
                  }),a.jsx("div", {
                    className:et("w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",S==="WALLET"?"border-primary bg-primary text-primary-foreground":"border-border"),children:S==="WALLET"&&a.jsx(pn, {
                      className:"w-2.5 h-2.5 stroke-[3]"
                    })
                  })]
                }),a.jsxs("div", {
                  className:"pt-2 border-t border-border flex items-center justify-between text-xs",children:[a.jsx("span", {
                    className:"text-[11px] text-text-muted",children:m("checkoutModal.currentBalance")
                  }),a.jsx("span", {
                    className:"font-semibold text-primary",children:a.jsx(Fs, {
                      locales:"vi-VN",value:ae,format: {
                        style:"currency",currency:"VND",minimumFractionDigits:0
                      }
                      
                    })
                  })]
                })]
              }),a.jsxs("button", {
                type:"button",onClick:()=>fe("BANK_TRANSFER"),disabled:N,className:et("relative p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-3",S==="BANK_TRANSFER"?"bg-sky-500/5 border-sky-500":"bg-surface border-border hover:border-sky-500/50"),children:[a.jsxs("div", {
                  className:"flex items-start justify-between w-full",children:[a.jsxs("div", {
                    className:"flex items-center gap-2.5",children:[a.jsx("div", {
                      className:et("p-1.5 rounded-lg border transition-colors",S==="BANK_TRANSFER"?"bg-sky-500 text-white border-sky-500":"bg-surface-2 text-sky-500 border-border"),children:a.jsx(Yi, {
                        className:"w-4 h-4"
                      })
                    }),a.jsxs("div", {
                      children:[a.jsx("div", {
                        className:"flex items-center gap-1.5",children:a.jsx("span", {
                          className:"text-xs font-semibold text-text",children:m("checkoutModal.methodBank")
                        })
                      }),a.jsx("div", {
                        className:"text-[10px] text-text-muted leading-tight mt-0.5",children:m("checkoutModal.methodBankDesc")
                      })]
                    })]
                  }),a.jsx("div", {
                    className:et("w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",S==="BANK_TRANSFER"?"border-sky-500 bg-sky-500 text-white":"border-border"),children:S==="BANK_TRANSFER"&&a.jsx(pn, {
                      className:"w-2.5 h-2.5 stroke-[3]"
                    })
                  })]
                }),a.jsxs("div", {
                  className:"pt-2 border-t border-border flex items-center justify-between text-[11px]",children:[a.jsx("span", {
                    className:"text-sky-500 font-semibold",children:m("checkoutModal.methodBankBadge")
                  }),a.jsx(fn, {
                    className:"w-3 h-3 text-sky-500"
                  })]
                })]
              })]
            })]
          }),S==="WALLET"?a.jsx("div", {
            className:"p-3 rounded-xl bg-surface border border-border space-y-2",children:te?a.jsxs("div", {
              className:"flex items-center gap-2 text-emerald-500 text-xs font-medium bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10",children:[a.jsx(Sn, {
                className:"w-4 h-4 shrink-0"
              }),a.jsx("span", {
                children:m("checkoutModal.sufficientBalance")
              })]
            }):a.jsxs("div", {
              className:"space-y-2",children:[a.jsx("div", {
                className:"flex items-center justify-between text-xs text-rose-500 bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10 font-medium",children:a.jsx("span", {
                  children:m("checkoutModal.insufficientBalance", {
                    amount:`${K.toLocaleString("vi-VN")} ₫`
                  })
                })
              }),c&&a.jsxs("button", {
                type:"button",onClick:c,className:"w-full py-2 px-3 rounded-lg bg-surface border border-primary/20 hover:bg-primary/5 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer",children:[a.jsx(Ho, {
                  className:"w-3.5 h-3.5"
                }),a.jsx("span", {
                  children:m("checkoutModal.topupWalletBtn")
                })]
              })]
            })
          }):a.jsxs("div", {
            className:"p-4 rounded-xl bg-surface border border-border space-y-3",children:[a.jsxs("div", {
              className:"flex items-center justify-between",children:[a.jsxs("div", {
                className:"text-xs font-semibold text-text flex items-center gap-1.5",children:[a.jsx(Yi, {
                  className:"w-4 h-4 text-sky-500"
                }),a.jsx("span", {
                  children:m("checkoutModal.bankInfoTitle")
                })]
              }),a.jsxs("div", {
                className:"flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-[10px] text-sky-500 font-medium",children:[a.jsx(fn, {
                  className:"w-3 h-3"
                }),a.jsx("span", {
                  children:m("checkoutModal.methodBankBadge")
                })]
              })]
            }),D&&a.jsx("div", {
              className:"text-[11px] text-amber-500 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5",children:m("checkoutModal.walletLockedByBank")
            }),Y?a.jsxs("div", {
              className:"py-8 flex flex-col items-center justify-center gap-2 text-text-muted text-xs",children:[a.jsx(gn, {
                className:"w-6 h-6 text-sky-500 animate-spin"
              }),a.jsx("span", {
                children:m("topupModal.loadingQr")
              })]
            }):N?a.jsxs("div", {
              className:"py-8 flex flex-col items-center justify-center gap-2 text-text-muted text-xs",children:[a.jsx(gn, {
                className:"w-8 h-8 text-sky-500 animate-spin"
              }),a.jsx("span", {
                className:"font-medium text-sky-500",children:"Đang xử lý thanh toán..."
              })]
            }):V?.qrData?a.jsxs("div", {
              className:"flex flex-col md:flex-row items-center md:items-start gap-4 p-1",children:[a.jsxs("div", {
                className:"flex flex-col items-center gap-2 shrink-0",children:[a.jsxs("div", {
                  className:"relative p-2 bg-white rounded-xl border border-border group",children:[a.jsx("img", {
                    src:V.qrData.qrCodeUrl,alt:"VietQR Code",className:"w-40 h-40 object-contain rounded-lg"
                  }),a.jsx("button", {
                    type:"button",onClick:()=>P(!0),className:"absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors cursor-zoom-in",title:"Phóng to mã QR",children:a.jsxs("span", {
                      className:"opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-lg px-2 py-1 flex items-center gap-1 text-[10px] font-medium",children:[a.jsx(Os, {
                        className:"w-3 h-3"
                      }),"Phóng to"]
                    })
                  })]
                }),a.jsxs("span", {
                  className:"text-[10px] text-text-muted flex items-center gap-1",children:[a.jsx(Sm, {
                    className:"w-3.5 h-3.5 text-sky-500"
                  }),a.jsx("span", {
                    children:"Quét mã bằng App Ngân hàng"
                  })]
                })]
              }),a.jsxs("div", {
                className:"flex-1 w-full space-y-2 text-xs my-auto",children:[a.jsxs("div", {
                  className:"flex items-center justify-between p-2 rounded-lg bg-card border border-border",children:[a.jsxs("span", {
                    className:"text-text-muted",children:[m("topupModal.bankName"),":"]
                  }),a.jsx("span", {
                    className:"font-semibold text-text",children:V.qrData.bankName
                  })]
                }),V.qrData.accountName&&a.jsxs("div", {
                  className:"flex items-center justify-between p-2 rounded-lg bg-card border border-border",children:[a.jsxs("span", {
                    className:"text-text-muted",children:[m("topupModal.accountName"),":"]
                  }),a.jsx("span", {
                    className:"font-semibold text-text",children:V.qrData.accountName
                  })]
                }),a.jsxs("div", {
                  className:"flex items-center justify-between p-2 rounded-lg bg-card border border-border",children:[a.jsxs("span", {
                    className:"text-text-muted",children:[m("topupModal.accountNumber"),":"]
                  }),a.jsxs("div", {
                    className:"flex items-center gap-2",children:[a.jsx("span", {
                      className:"font-semibold text-primary",children:V.qrData.accountNumber
                    }),a.jsx("button", {
                      type:"button",onClick:()=>he(V.qrData.accountNumber,"accountNumber",m("topupModal.accountNumber")),className:"p-1 hover:bg-surface-2 rounded-md text-text-muted hover:text-text transition-colors cursor-pointer",title:m("topupModal.accountNumber"),children:C==="accountNumber"?a.jsx(pn, {
                        className:"w-3.5 h-3.5 text-emerald-500"
                      }):a.jsx(Bs, {
                        className:"w-3.5 h-3.5"
                      })
                    })]
                  })]
                }),a.jsxs("div", {
                  className:"flex items-center justify-between p-2 rounded-lg bg-card border border-border",children:[a.jsxs("span", {
                    className:"text-text-muted",children:[m("checkoutModal.paymentAmount"),":"]
                  }),a.jsxs("div", {
                    className:"flex items-center gap-2",children:[a.jsx("span", {
                      className:"font-semibold text-emerald-500",children:a.jsx(Fs, {
                        locales:"vi-VN",value:l,format: {
                          style:"currency",currency:"VND",minimumFractionDigits:0
                        }
                        
                      })
                    }),a.jsx("button", {
                      type:"button",onClick:()=>he(String(l),"amount",m("checkoutModal.paymentAmount")),className:"p-1 hover:bg-surface-2 rounded-md text-text-muted hover:text-text transition-colors cursor-pointer",title:m("checkoutModal.paymentAmount"),children:C==="amount"?a.jsx(pn, {
                        className:"w-3.5 h-3.5 text-emerald-500"
                      }):a.jsx(Bs, {
                        className:"w-3.5 h-3.5"
                      })
                    })]
                  })]
                }),a.jsxs("div", {
                  className:"flex items-center justify-between p-2 rounded-lg bg-sky-500/5 border border-sky-500/20",children:[a.jsxs("span", {
                    className:"text-sky-500 font-medium",children:[m("topupModal.transferMemo"),":"]
                  }),a.jsxs("div", {
                    className:"flex items-center gap-2",children:[a.jsx("span", {
                      className:"font-semibold text-sky-500",children:V.qrData.memo
                    }),a.jsx("button", {
                      type:"button",onClick:()=>he(V.qrData.memo,"memo",m("topupModal.transferMemo")),className:"p-1 hover:bg-sky-500/10 rounded-md text-sky-500 transition-colors cursor-pointer",title:m("topupModal.transferMemo"),children:C==="memo"?a.jsx(pn, {
                        className:"w-3.5 h-3.5 text-emerald-500"
                      }):a.jsx(Bs, {
                        className:"w-3.5 h-3.5"
                      })
                    })]
                  })]
                })]
              })]
            }):a.jsxs("div", {
              className:"py-4 flex flex-col items-center justify-center gap-3 text-center",children:[a.jsx("p", {
                className:"text-[11px] text-text-muted max-w-sm",children:m("checkoutModal.createBankQrHint")
              }),a.jsxs(Ue, {
                type:"button",onClick:X,disabled:Y,className:"py-2 px-5 rounded-lg bg-sky-500 text-white font-semibold text-xs hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",children:[a.jsx(Yi, {
                  className:"w-4 h-4"
                }),a.jsx("span", {
                  children:m("checkoutModal.createBankQrBtn")
                })]
              })]
            })]
          }),S==="WALLET"&&!R&&a.jsxs("div", {
            className:"pt-3 flex items-center justify-end gap-2 border-t border-border",children:[a.jsx(Ue, {
              type:"button",variant:"outline",onClick:t,className:"py-2 px-4 rounded-lg text-xs font-medium",children:m("checkoutModal.cancel")
            }),a.jsxs(Ue, {
              type:"button",variant:"gradient",onClick:()=>L(!0),disabled:D||!te,className:"py-2 px-5 rounded-lg text-xs font-black shadow-glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",children:[a.jsx(Ho, {
                className:"w-4 h-4"
              }),a.jsx("span", {
                children:m("checkoutModal.confirmPayWallet")
              })]
            })]
          }),S==="WALLET"&&R&&a.jsxs("div", {
            className:"pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border",children:[a.jsx("span", {
              className:"text-xs font-medium text-amber-500",children:m("checkoutModal.confirmWalletQuestion", {
                amount:`${l.toLocaleString("vi-VN")} ₫`
              })
            }),a.jsxs("div", {
              className:"flex items-center justify-end gap-2",children:[a.jsx(Ue, {
                type:"button",variant:"outline",onClick:()=>L(!1),disabled:N,className:"py-2 px-4 rounded-lg text-xs font-medium",children:m("checkoutModal.back")
              }),a.jsx(Ue, {
                type:"button",variant:"gradient",onClick:ve,disabled:N||D||!te,className:"py-2 px-5 rounded-lg text-xs font-black shadow-glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",children:N?a.jsxs(a.Fragment, {
                  children:[a.jsx(gn, {
                    className:"w-4 h-4 animate-spin"
                  }),a.jsx("span", {
                    children:m("checkoutModal.confirming")
                  })]
                }):a.jsxs(a.Fragment, {
                  children:[a.jsx(pn, {
                    className:"w-4 h-4"
                  }),a.jsx("span", {
                    children:m("checkoutModal.confirmWalletAgree")
                  })]
                })
              })]
            })]
          })]
        })
      })]
    }),F&&V?.qrData&&a.jsx("div", {
      className:"fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm",onClick:()=>P(!1),children:a.jsxs("div", {
        className:"relative flex flex-col items-center gap-4",onClick:Ve=>Ve.stopPropagation(),children:[a.jsx("button", {
          type:"button",onClick:()=>P(!1),className:"absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-card border border-border text-text-muted hover:text-text transition-colors cursor-pointer",children:a.jsx(Yt, {
            className:"w-4 h-4"
          })
        }),a.jsxs("div", {
          className:"relative p-4 bg-white rounded-2xl shadow-2xl overflow-hidden",children:[a.jsx("img", {
            src:V.qrData.qrCodeUrl,alt:"VietQR Code",className:"w-[700px] h-[700px] object-contain rounded-lg"
          }),a.jsx("div", {
            className:"absolute left-4 right-4 h-[3px] rounded-full pointer-events-none",style: {
              background:"linear-gradient(90deg, transparent 0%, #38bdf8 30%, #0ea5e9 50%, #38bdf8 70%, transparent 100%)",boxShadow:"0 0 10px 4px rgba(14,165,233,0.5), 0 0 24px 6px rgba(14,165,233,0.2)",animation:"qr-scan-beam 3.2s cubic-bezier(0.45,0,0.55,1) infinite"
            }
            
          }),a.jsx("div", {
            className:"absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-sky-400 rounded-tl-md pointer-events-none"
          }),a.jsx("div", {
            className:"absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-sky-400 rounded-tr-md pointer-events-none"
          }),a.jsx("div", {
            className:"absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-sky-400 rounded-bl-md pointer-events-none"
          }),a.jsx("div", {
            className:"absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-sky-400 rounded-br-md pointer-events-none"
          }),a.jsx("style", {
            children:`
                @keyframes qr-scan-beam {
                  0%        { top: 1rem;              opacity: 0;   }
                  5%        { opacity: 1;                           }
                  47%       { opacity: 1;                           }
                  50%       { top: calc(100% - 1rem); opacity: 0.5; }
                  53%       { opacity: 1;                           }
                  95%       { opacity: 1;                           }
                  100%      { top: 1rem;              opacity: 0;   }
                }
              `
          })]
        }),a.jsxs("p", {
          className:"text-xs text-white/70 flex items-center gap-1.5",children:[a.jsx(Sm, {
            className:"w-3.5 h-3.5 text-sky-400"
          }),"Quét mã bằng App Ngân hàng để thanh toán"]
        })]
      })
    })]
  })
},Sk="deluxe_gaming_cart_selected_ids",l$=()=> {
  const {
    t:e
  }
  =Pt(),t=ss(),n=Jr(P=>P.cartItems),s=Jr(P=>P.loading),i=Jr(P=>P.error),l=Jr(P=>P.fetchCart),c=Jr(P=>P.updateCartItem),d=Jr(P=>P.removeCartItem),f=Jr(P=>P.clearCart),[m,p]=w.useState(null),[g,y]=w.useState(new Set),[S,v]=w.useState(!1),[N,j]=w.useState(!1),_=w.useRef(null);
  w.useEffect(()=> {
    _.current&&mA(_.current)
  },[_]),w.useEffect(()=> {
    l()
  },[l]),w.useEffect(()=> {
    if(n.length===0) {
      y(new Set);
      return
    }
    const P=new Set(n.map(Y=>Y.id));
    try {
      const Y=localStorage.getItem(Sk);
      if(Y) {
        const q=JSON.parse(Y);
        if(Array.isArray(q)&&q.length>0) {
          const D=q.filter(X=>P.has(X));
          if(!S) {
            y(new Set(D)),v(!0);
            return
          }
          
        }
        
      }
      
    }
    catch(Y) {
      console.error("Failed to parse cart selected IDs from localStorage:",Y)
    }
    S||(y(new Set(n.map(Y=>Y.id))),v(!0))
  },[n,S]);
  const k=w.useCallback(P=> {
    y(P);
    try {
      localStorage.setItem(Sk,JSON.stringify(Array.from(P)))
    }
    catch(Y) {
      console.error("Failed to save cart selected IDs to localStorage:",Y)
    }
    
  },[]),C=w.useCallback((P,Y)=> {
    Y?.stopPropagation();
    const q=new Set(g);
    q.has(P)?q.delete(P):q.add(P),k(q)
  },[g,k]),A=w.useMemo(()=>n.length>0&&n.every(P=>g.has(P.id)),[n,g]),U=w.useCallback(()=> {
    k(A?new Set:new Set(n.map(P=>P.id)))
  },[A,n,k]),B=w.useMemo(()=>n.filter(P=>g.has(P.id)),[n,g]),R=w.useMemo(()=>B.reduce((P,Y)=>P+Y.quantity,0),[B]),L=w.useMemo(()=>B.reduce((P,Y)=>P+(Y.totalPrice||Y.unitPrice*Y.quantity),0),[B]),$=w.useCallback(async(P,Y)=> {
    if(!(Y<1||Y>99)) {
      p(P);
      try {
        await c(P,Y)
      }
      catch(q) {
        console.error("Failed to update cart item quantity:",q)
      }
      finally {
        p(null)
      }
      
    }
    
  },[c]),M=w.useCallback((P,Y)=> {
    const q=parseInt(Y,10);
    if(isNaN(q)||q<1)$(P,1);
    else {
      const D=Math.min(99,Math.max(1,q));
      $(P,D)
    }
    
  },[$]),H=w.useCallback(async P=> {
    p(P);
    try {
      await d(P),Be.info(e("cartScreen.removedItem"))
    }
    catch(Y) {
      console.error("Failed to remove cart item:",Y)
    }
    finally {
      p(null)
    }
    
  },[d,e]),ae=w.useCallback(async()=> {
    try {
      await f(),k(new Set),Be.info(e("cartScreen.clearedCart"))
    }
    catch(P) {
      console.error("Failed to clear cart:",P)
    }
    
  },[f,k,e]),te=w.useCallback(()=> {
    t("/store")
  },[t]),K=w.useCallback(()=> {
    B.length!==0&&j(!0)
  },[B.length]),V=w.useCallback(()=> {
    j(!1)
  },[]),E=w.useCallback(()=> {
    l(),k(new Set)
  },[l,k]),F=w.useCallback(P=> {
    t(`/store/${P.slug||P.id}`)
  },[t]);
  return a.jsxs("div", {
    className:"w-full space-y-5",children:[a.jsxs("div", {
      className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[a.jsxs("div", {
        className:"flex items-center gap-2.5",children:[a.jsx("div", {
          className:"w-1 h-5 rounded-full bg-primary"
        }),a.jsxs("h1", {
          className:"text-xl font-bold text-text flex items-center gap-2",children:[e("cartScreen.title"),n.length>0&&a.jsx("span", {
            className:"text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary tabular-nums",children:n.length
          })]
        })]
      }),n.length>0&&a.jsxs(Ue, {
        type:"button",onClick:ae,className:"h-8 px-3 rounded-lg text-xs font-medium text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(Nm, {
          className:"w-3.5 h-3.5"
        }),a.jsx("span", {
          children:e("cartScreen.clearAll")
        })]
      })]
    }),s&&a.jsx("div", {
      className:"space-y-3",children:Array.from( {
        length:3
      }).map((P,Y)=>a.jsxs("div", {
        className:"p-4 rounded-xl bg-card border border-border flex items-center gap-3 animate-pulse",children:[a.jsx("div", {
          className:"w-20 aspect-[4/3] rounded-lg bg-surface-2"
        }),a.jsxs("div", {
          className:"flex-1 space-y-2",children:[a.jsx("div", {
            className:"h-4 bg-surface-2 rounded w-1/2"
          }),a.jsx("div", {
            className:"h-3 bg-surface-2 rounded w-1/4"
          })]
        })]
      },Y))
    }),!s&&i&&a.jsxs("div", {
      className:"text-center py-12 space-y-3",children:[a.jsx(tl, {
        className:"w-10 h-10 text-text-muted mx-auto"
      }),a.jsx("p", {
        className:"text-sm text-text-muted",children:i
      }),a.jsxs(Ue, {
        type:"button",onClick:()=>l(),className:"px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(nr, {
          className:"w-4 h-4"
        }),a.jsx("span", {
          children:e("common.buttons.retry")
        })]
      })]
    }),!s&&!i&&n.length===0&&a.jsxs("div", {
      className:"text-center py-16 space-y-3",children:[a.jsx(tl, {
        className:"w-10 h-10 text-text-muted mx-auto"
      }),a.jsx("h3", {
        className:"text-base font-semibold text-text",children:e("cartScreen.empty")
      }),a.jsx("p", {
        className:"text-sm text-text-muted",children:e("cartScreen.emptyDesc")
      }),a.jsxs(Ue, {
        type:"button",onClick:te,className:"mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(no, {
          className:"w-4 h-4"
        }),a.jsx("span", {
          children:e("cartScreen.exploreStore")
        })]
      })]
    }),!s&&!i&&n.length>0&&a.jsxs("div", {
      className:"grid grid-cols-1 lg:grid-cols-12 gap-5 items-start",children:[a.jsxs("div", {
        className:"lg:col-span-8 space-y-2",ref:_,children:[a.jsxs("div", {
          className:"p-3 rounded-xl bg-card border border-border flex items-center justify-between",children:[a.jsxs("button", {
            type:"button",onClick:U,className:"flex items-center gap-2.5 text-xs font-medium text-text hover:text-primary transition-colors cursor-pointer select-none",children:[a.jsx("div", {
              className:et("w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors",A?"bg-primary border-primary text-primary-foreground":"bg-surface border-border text-transparent hover:border-primary/50"),children:a.jsx(pn, {
                className:"w-3 h-3 stroke-[3]"
              })
            }),a.jsxs("span", {
              children:[e("cartScreen.selectAll")," (",B.length,"/",n.length,")"]
            })]
          }),a.jsx("span", {
            className:"text-xs text-text-muted",children:e("cartScreen.selectedItems", {
              count:R
            })
          })]
        }),n.map(P=> {
          const Y=P.product,q=g.has(P.id);
          return a.jsxs("div", {
            className:et("p-3 rounded-xl bg-card border flex items-center justify-between gap-3 transition-colors",q?"border-primary/30":"border-border opacity-60 hover:opacity-100"),children:[a.jsxs("div", {
              className:"flex items-center gap-3 flex-1 min-w-0",children:[a.jsx("button", {
                type:"button",onClick:D=>C(P.id,D),className:"cursor-pointer shrink-0",title:e(q?"cartScreen.deselect":"cartScreen.selectItem"),children:a.jsx("div", {
                  className:et("w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors",q?"bg-primary border-primary text-primary-foreground":"bg-surface border-border text-transparent hover:border-primary/50"),children:a.jsx(pn, {
                    className:"w-3 h-3 stroke-[3]"
                  })
                })
              }),a.jsxs("div", {
                onClick:()=>F(Y),className:"flex items-center gap-3 flex-1 min-w-0 cursor-pointer group",children:[a.jsx("div", {
                  className:"w-16 sm:w-20 aspect-[4/3] rounded-lg overflow-hidden bg-surface shrink-0",children:a.jsx(fi, {
                    src:Y.thumbnail?.url,alt:Y.title,fallbackTitle:Y.title,className:"w-full h-full object-cover"
                  })
                }),a.jsxs("div", {
                  className:"flex-1 min-w-0",children:[a.jsx("h4", {
                    className:"text-sm font-medium text-text group-hover:text-primary transition-colors line-clamp-1",children:Y.title
                  }),P.variant?.title&&a.jsx("div", {
                    className:"text-xs text-text-muted mt-0.5 line-clamp-1",children:P.variant.title
                  }),a.jsx("div", {
                    className:"text-xs text-text-muted mt-0.5",children:a.jsxs("span", {
                      className:"font-semibold bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent",children:[P.unitPrice.toLocaleString("vi-VN")," ₫"]
                    })
                  })]
                })]
              })]
            }),a.jsxs("div", {
              className:"flex items-center gap-2 sm:gap-3 shrink-0",children:[a.jsxs("div", {
                className:"flex items-center border border-border rounded-lg overflow-hidden",children:[a.jsx("button", {
                  type:"button",onClick:()=>$(P.id,P.quantity-1),disabled:P.quantity<=1||m===P.id,className:"p-1.5 text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer",children:a.jsx(yC, {
                    className:"w-3 h-3"
                  })
                }),a.jsx("input", {
                  type:"number",min:1,max:99,value:P.quantity,onChange:D=>M(P.id,D.target.value),className:"w-8 text-center bg-transparent text-xs font-semibold text-text outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                }),a.jsx("button", {
                  type:"button",onClick:()=>$(P.id,P.quantity+1),disabled:m===P.id,className:"p-1.5 text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer",children:a.jsx(cd, {
                    className:"w-3 h-3"
                  })
                })]
              }),a.jsx("div", {
                className:"text-right min-w-[80px]",children:a.jsxs("span", {
                  className:"text-sm font-bold bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent tabular-nums",children:[(P.totalPrice||P.unitPrice*P.quantity).toLocaleString("vi-VN")," ₫"]
                })
              }),a.jsx("button", {
                type:"button",onClick:()=>H(P.id),disabled:m===P.id,className:"p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50",title:e("cartScreen.removeFromCart"),children:a.jsx(Nm, {
                  className:"w-4 h-4"
                })
              })]
            })]
          },P.id)
        })]
      }),a.jsxs("div", {
        className:"lg:col-span-4 p-5 rounded-xl bg-card border border-border space-y-4 sticky top-20",children:[a.jsx("h3", {
          className:"text-sm font-semibold text-text pb-3 border-b border-border",children:e("cartScreen.orderSummary")
        }),a.jsxs("div", {
          className:"space-y-2.5 text-sm",children:[a.jsxs("div", {
            className:"flex items-center justify-between text-text-muted",children:[a.jsx("span", {
              children:e("cartScreen.totalQuantity")
            }),a.jsx("span", {
              className:"font-medium text-text tabular-nums",children:a.jsx(Fs, {
                locales:"vi-VN",value:R
              })
            })]
          }),a.jsxs("div", {
            className:"flex items-center justify-between text-text-muted",children:[a.jsx("span", {
              children:e("cartScreen.subtotal")
            }),a.jsx("span", {
              className:"font-medium text-text tabular-nums",children:a.jsx(Fs, {
                locales:"vi-VN",value:L,format: {
                  style:"currency",currency:"VND",minimumFractionDigits:0
                }
                
              })
            })]
          }),a.jsxs("div", {
            className:"pt-2.5 border-t border-border flex items-baseline justify-between",children:[a.jsx("span", {
              className:"font-semibold text-text",children:e("cartScreen.totalPayment")
            }),a.jsxs("span", {
              className:"text-lg font-black bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent tabular-nums",children:[L.toLocaleString("vi-VN")," ₫"]
            })]
          })]
        }),a.jsxs(Ue, {
          type:"button",onClick:K,disabled:R===0,className:"w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",children:[a.jsx(lv, {
            className:"w-4 h-4"
          }),a.jsx("span", {
            children:e("cartScreen.checkout", {
              count:R
            })
          })]
        })]
      })]
    }),a.jsx(pA, {
      isOpen:N,onClose:V,cartItems:B,totalPrice:L,onCheckoutSuccess:E
    })]
  })
},hb="/assets/discord-qr-BZwM1kg0.png",fb="/assets/zalo-qr-B7A-vxrl.png",Is= {
  ZALO_PHONE_NUMBER:"0333927777",ZALO_URL:"https://zalo.me/0333927777",SUPPORT_EMAIL:"deluxegaming.help@gmail.com",WEBSITE_URL:"https://www.deluxe-gaming.com",WEBSITE_DISPLAY:"www.deluxe-gaming.com",FACEBOOK_URL:"https://www.facebook.com/profile.php?id=61592209272680"
},Nk=[ {
  value:1e4,suffix:"+",labelKey:"community.stats.orders"
}, {
  value:500,suffix:"+",labelKey:"community.stats.products"
}, {
  value:4.9,suffix:"★",labelKey:"community.stats.rating"
}, {
  value:72,suffix:"h",labelKey:"community.stats.warranty"
}, {
  value:0,suffix:"9-23h",labelKey:"community.stats.support"
}
],c$=( {
  className:e="w-5 h-5"
})=>a.jsx("svg", {
  className:e,viewBox:"0 0 24 24",fill:"currentColor",children:a.jsx("path", {
    d:"M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
  })
}),u$=( {
  className:e="w-5 h-5"
})=>a.jsx("svg", {
  className:e,viewBox:"0 0 24 24",fill:"currentColor",children:a.jsx("path", {
    d:"M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95a.75.75 0 0 0 .937.937l4.782-1.388A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-3.75 6.5h7.5a.75.75 0 0 1 .53 1.28L12.56 13.5h3.69a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.53-1.28l3.72-3.72H8.25a.75.75 0 0 1 0-1.5z"
  })
}),jk=( {
  className:e="w-5 h-5"
})=>a.jsx("svg", {
  className:e,viewBox:"0 0 24 24",fill:"currentColor",children:a.jsx("path", {
    d:"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
  })
}),d$=()=> {
  const {
    t:e
  }
  =Pt(),[t,n]=w.useState(!1),[s,i]=w.useState(!1),[l,c]=w.useState(null);
  w.useEffect(()=> {
    const m=setTimeout(()=>n(!0),120);
    return()=>clearTimeout(m)
  },[]);
  const d=w.useMemo(()=>Nk.map(m=>t?m.value:0),[t]),f=()=> {
    navigator.clipboard.writeText(Is.ZALO_PHONE_NUMBER),i(!0),setTimeout(()=>i(!1),2e3)
  };
  return a.jsxs("div", {
    className:"w-full max-w-5xl mx-auto py-6 px-4",children:[a.jsxs("div", {
      className:"relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-surface to-background border border-primary/20 p-6 sm:p-8 mb-8 shadow-xl text-center",children:[a.jsx("div", {
        className:"absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
      }),a.jsxs("div", {
        className:"relative z-10 flex flex-col items-center",children:[a.jsx("div", {
          className:"w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-3 shadow-lg shadow-primary/10",children:a.jsx(Gi, {
            className:"w-7 h-7"
          })
        }),a.jsx("h1", {
          className:"text-2xl sm:text-3xl font-black text-text tracking-tight mb-2",children:e("community.title")
        }),a.jsx("p", {
          className:"text-sm text-text-muted font-medium max-w-xl",children:e("community.subtitle")
        })]
      })]
    }),a.jsx("div", {
      className:"mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500",children:a.jsx("div", {
        className:"rounded-2xl bg-card border border-border/60 px-4 py-4 shadow-sm",children:a.jsx("div", {
          className:"grid grid-cols-5 divide-x divide-border/50",children:Nk.map((m,p)=>a.jsxs("div", {
            className:"flex flex-col items-center justify-center px-2 py-1 gap-0.5",children:[m.value===0?a.jsx("span", {
              className:"text-lg sm:text-xl font-black text-primary tracking-tight leading-none",children:m.suffix
            }):a.jsxs("span", {
              className:"text-lg sm:text-xl font-black text-primary tracking-tight leading-none flex items-baseline gap-px",children:[a.jsx(Fs, {
                value:d[p],format:m.suffix==="★"? {
                  minimumFractionDigits:1,maximumFractionDigits:1
                }
                : {
                  maximumFractionDigits:0
                },transformTiming: {
                  duration:900,easing:"ease-out"
                },spinTiming: {
                  duration:900,easing:"ease-out"
                },opacityTiming: {
                  duration:350,easing:"ease-out"
                }
                
              }),a.jsx("span", {
                children:m.suffix
              })]
            }),a.jsx("span", {
              className:"text-[10px] sm:text-xs text-text-muted font-medium text-center leading-tight",children:e(m.labelKey)
            })]
          },m.labelKey))
        })
      })
    }),a.jsxs("div", {
      className:"mb-8",children:[a.jsxs("h2", {
        className:"text-lg font-bold text-text mb-4 flex items-center gap-2",children:[a.jsx(fn, {
          className:"w-5 h-5 text-primary"
        }),a.jsx("span", {
          children:"Kênh Cộng Đồng Chính Thức"
        })]
      }),a.jsxs("div", {
        className:"grid grid-cols-1 md:grid-cols-3 gap-5",children:[a.jsxs("div", {
          className:"group rounded-3xl bg-card border border-border/70 hover:border-[#5865F2]/50 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-[#5865F2]/10 flex flex-col justify-between",children:[a.jsxs("div", {
            children:[a.jsxs("div", {
              className:"flex items-center justify-between gap-2 mb-4",children:[a.jsx("div", {
                className:"w-11 h-11 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] shadow-sm",children:a.jsx(c$, {
                  className:"w-6 h-6"
                })
              }),a.jsx("span", {
                className:"px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-[#5865F2]/15 text-[#5865F2] border border-[#5865F2]/30",children:"Discord Server"
              })]
            }),a.jsx("h3", {
              className:"text-base font-bold text-text mb-1",children:"Cộng đồng Discord"
            }),a.jsx("p", {
              className:"text-xs text-text-muted mb-4 leading-relaxed",children:"Giao lưu, tìm đồng đội chơi game, nhận thông báo sự kiện & ưu đãi game mới nhất."
            }),a.jsxs("div", {
              onClick:()=>c( {
                title:"Máy Chủ Discord Deluxe Gaming",subtitle:"Quét mã QR bằng ứng dụng Discord hoặc máy ảnh để tham gia",image:hb,appName:"Discord"
              }),className:"relative rounded-2xl bg-surface border border-border/60 p-3 mb-4 flex flex-col items-center justify-center group-hover:border-[#5865F2]/40 transition-colors cursor-pointer",children:[a.jsx("img", {
                src:hb,alt:"Discord QR",className:"w-36 h-36 object-contain rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
              }),a.jsxs("div", {
                className:"absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-1.5 text-white text-xs font-bold",children:[a.jsx(Yi, {
                  className:"w-4 h-4"
                })," Phóng to QR"]
              })]
            })]
          }),a.jsxs(Ue, {
            type:"button",onClick:()=>c( {
              title:"Máy Chủ Discord Deluxe Gaming",subtitle:"Quét mã QR bằng ứng dụng Discord hoặc máy ảnh để tham gia",image:hb,appName:"Discord"
            }),className:"w-full gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold cursor-pointer shadow-md shadow-[#5865F2]/25",children:[a.jsx(Yi, {
              className:"w-4 h-4"
            })," Quét mã QR Discord"]
          })]
        }),a.jsxs("div", {
          className:"group rounded-3xl bg-card border border-border/70 hover:border-[#0068FF]/50 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-[#0068FF]/10 flex flex-col justify-between",children:[a.jsxs("div", {
            children:[a.jsxs("div", {
              className:"flex items-center justify-between gap-2 mb-4",children:[a.jsx("div", {
                className:"w-11 h-11 rounded-2xl bg-[#0068FF]/15 border border-[#0068FF]/30 flex items-center justify-center text-[#0068FF] shadow-sm",children:a.jsx(u$, {
                  className:"w-6 h-6"
                })
              }),a.jsx("span", {
                className:"px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-[#0068FF]/15 text-[#0068FF] border border-[#0068FF]/30",children:"Cộng đồng Zalo"
              })]
            }),a.jsx("h3", {
              className:"text-base font-bold text-text mb-1",children:"Premium Zone - Zalo Group"
            }),a.jsx("p", {
              className:"text-xs text-text-muted mb-4 leading-relaxed",children:"Nhóm Zalo chính thức hỗ trợ khách hàng, cập nhật tài khoản game & flash sale giá rẻ."
            }),a.jsxs("div", {
              onClick:()=>c( {
                title:"Premium Zone - Deluxe Gaming Zalo",subtitle:"Quét mã QR này bằng ứng dụng Zalo để tham gia nhóm",image:fb,appName:"Zalo"
              }),className:"relative rounded-2xl bg-surface border border-border/60 p-3 mb-4 flex flex-col items-center justify-center group-hover:border-[#0068FF]/40 transition-colors cursor-pointer",children:[a.jsx("img", {
                src:fb,alt:"Zalo QR",className:"w-36 h-36 object-contain rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
              }),a.jsxs("div", {
                className:"absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-1.5 text-white text-xs font-bold",children:[a.jsx(Yi, {
                  className:"w-4 h-4"
                })," Phóng to QR"]
              })]
            })]
          }),a.jsxs(Ue, {
            type:"button",onClick:()=>c( {
              title:"Premium Zone - Deluxe Gaming Zalo",subtitle:"Quét mã QR này bằng ứng dụng Zalo để tham gia nhóm",image:fb,appName:"Zalo"
            }),className:"w-full gap-2 bg-[#0068FF] hover:bg-[#0052CC] text-white font-semibold cursor-pointer shadow-md shadow-[#0068FF]/25",children:[a.jsx(Yi, {
              className:"w-4 h-4"
            })," Quét mã QR Zalo"]
          })]
        }),a.jsxs("div", {
          className:"group rounded-3xl bg-card border border-border/70 hover:border-[#1877F2]/50 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-[#1877F2]/10 flex flex-col justify-between",children:[a.jsxs("div", {
            children:[a.jsxs("div", {
              className:"flex items-center justify-between gap-2 mb-4",children:[a.jsx("div", {
                className:"w-11 h-11 rounded-2xl bg-[#1877F2]/15 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] shadow-sm",children:a.jsx(jk, {
                  className:"w-6 h-6"
                })
              }),a.jsx("span", {
                className:"px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/30",children:"Facebook Page"
              })]
            }),a.jsx("h3", {
              className:"text-base font-bold text-text mb-1",children:"Fanpage Facebook Chính Thức"
            }),a.jsx("p", {
              className:"text-xs text-text-muted mb-4 leading-relaxed",children:"Theo dõi tin tức hot, sự kiện giveaway quà tặng hàng tuần & hỗ trợ tư vấn 24/7."
            }),a.jsxs("div", {
              className:"rounded-2xl bg-surface border border-border/60 p-4 mb-4 flex flex-col items-center justify-center text-center gap-2 min-h-[174px]",children:[a.jsx("div", {
                className:"w-12 h-12 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2]",children:a.jsx(jk, {
                  className:"w-7 h-7"
                })
              }),a.jsxs("div", {
                children:[a.jsx("span", {
                  className:"text-xs font-bold text-text block",children:"Deluxe Gaming Fanpage"
                }),a.jsx("span", {
                  className:"text-[11px] text-text-muted",children:"Cập nhật tin tức & hỗ trợ nhắn tin tin cậy"
                })]
              })]
            })]
          }),a.jsx("a", {
            href:Is.FACEBOOK_URL,target:"_blank",rel:"noreferrer",className:"w-full",children:a.jsxs(Ue, {
              type:"button",className:"w-full gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold cursor-pointer shadow-md shadow-[#1877F2]/25",children:[a.jsx(op, {
                className:"w-4 h-4"
              })," Ghé thăm Fanpage"]
            })
          })]
        })]
      })]
    }),a.jsxs("div", {
      className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2", {
        className:"text-lg font-bold text-text mb-6 flex items-center gap-2",children:[a.jsx(js, {
          className:"w-5 h-5 text-primary"
        }),a.jsx("span", {
          children:"Kênh Liên Hệ Direct & Hỗ Trợ Kỹ Thuật"
        })]
      }),a.jsxs("div", {
        className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[a.jsxs("div", {
          className:"flex items-start gap-3.5 p-4 rounded-2xl bg-surface/60 border border-border/50",children:[a.jsx("div", {
            className:"w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0",children:a.jsx(lp, {
              className:"w-5 h-5"
            })
          }),a.jsxs("div", {
            className:"min-w-0 flex-1",children:[a.jsx("span", {
              className:"text-xs text-text-muted font-medium block mb-0.5",children:e("community.hotlineLabel")
            }),a.jsxs("div", {
              className:"flex items-center gap-2",children:[a.jsx("a", {
                href:`tel:${Is.ZALO_PHONE_NUMBER}`,className:"text-sm font-bold text-text hover:text-primary transition-colors truncate",children:Is.ZALO_PHONE_NUMBER
              }),a.jsx("button", {
                type:"button",onClick:f,className:"p-1 rounded text-text-muted hover:text-primary transition-colors cursor-pointer",title:"Sao chép số điện thoại",children:s?a.jsx(pn, {
                  className:"w-3.5 h-3.5 text-success"
                }):a.jsx(Bs, {
                  className:"w-3.5 h-3.5"
                })
              })]
            })]
          })]
        }),a.jsxs("div", {
          className:"flex items-start gap-3.5 p-4 rounded-2xl bg-surface/60 border border-border/50",children:[a.jsx("div", {
            className:"w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0",children:a.jsx(el, {
              className:"w-5 h-5"
            })
          }),a.jsxs("div", {
            className:"min-w-0 flex-1",children:[a.jsx("span", {
              className:"text-xs text-text-muted font-medium block mb-0.5",children:e("community.emailLabel")
            }),a.jsx("a", {
              href:`mailto:${Is.SUPPORT_EMAIL}`,className:"text-xs sm:text-sm font-bold text-text hover:text-primary transition-colors truncate block",children:Is.SUPPORT_EMAIL
            })]
          })]
        }),a.jsxs("div", {
          className:"flex items-start gap-3.5 p-4 rounded-2xl bg-surface/60 border border-border/50",children:[a.jsx("div", {
            className:"w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0",children:a.jsx(gC, {
              className:"w-5 h-5"
            })
          }),a.jsxs("div", {
            className:"min-w-0 flex-1",children:[a.jsx("span", {
              className:"text-xs text-text-muted font-medium block mb-0.5",children:e("community.websiteLabel")
            }),a.jsx("a", {
              href:Is.WEBSITE_URL,target:"_blank",rel:"noreferrer",className:"text-xs sm:text-sm font-bold text-text hover:text-primary transition-colors truncate block",children:Is.WEBSITE_DISPLAY
            })]
          })]
        })]
      })]
    }),l&&a.jsx("div", {
      onClick:()=>c(null),className:"fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200 cursor-pointer overflow-y-auto",children:a.jsxs("div", {
        onClick:m=>m.stopPropagation(),className:"relative w-full max-w-xl bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden animate-in zoom-in-95 duration-200 cursor-default my-auto",children:[a.jsx("button", {
          type:"button",onClick:()=>c(null),className:"absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer",children:a.jsx(Yt, {
            className:"w-6 h-6"
          })
        }),a.jsxs("div", {
          className:"flex items-center justify-center gap-2 mb-2",children:[a.jsx("div", {
            className:"w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary",children:a.jsx(Yi, {
              className:"w-5 h-5"
            })
          }),a.jsxs("span", {
            className:"px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/30",children:[l.appName," QR Code"]
          })]
        }),a.jsx("h3", {
          className:"text-xl sm:text-2xl font-black text-text tracking-tight mb-1",children:l.title
        }),a.jsx("p", {
          className:"text-xs sm:text-sm text-text-muted mb-6 leading-relaxed max-w-md mx-auto",children:l.subtitle
        }),a.jsx("div", {
          className:"p-4 sm:p-6 bg-white rounded-3xl border border-border/40 shadow-2xl mb-6 inline-block max-w-full",children:a.jsx("img", {
            src:l.image,alt:l.appName,className:"w-[75vw] sm:w-[460px] h-auto max-h-[60vh] object-contain rounded-2xl mx-auto"
          })
        }),a.jsx("div", {
          className:"flex items-center justify-center gap-3",children:a.jsx(Ue, {
            type:"button",variant:"outline",size:"default",onClick:()=>c(null),className:"px-6 cursor-pointer font-semibold",children:"Đóng"
          })
        })]
      })
    })]
  })
},Tv=w.createContext( {
  
});
function Ev(e) {
  const t=w.useRef(null);
  return t.current===null&&(t.current=e()),t.current
}
const h$=typeof window<"u",fd=h$?w.useLayoutEffect:w.useEffect,up=w.createContext(null);
function Cv(e,t) {
  e.indexOf(t)===-1&&e.push(t)
}
function Om(e,t) {
  const n=e.indexOf(t);
  n>-1&&e.splice(n,1)
}
const la=(e,t,n)=>n>t?t:n<e?e:n;
let dp=()=> {
  
};
const pi= {
  
},Av=e=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e),gA=e=>typeof e=="object"&&e!==null,Ov=e=>/^0[^.\s]+$/u.test(e);
function xA(e) {
  let t;
  return()=>(t===void 0&&(t=e()),t)
}
const ia=e=>e,Od=(...e)=>e.reduce((t,n)=>s=>n(t(s))),md=(e,t,n)=> {
  const s=t-e;
  return s?(n-e)/s:1
};
class Rm {
  constructor() {
    this.subscriptions=[]
  }
  add(t) {
    return Cv(this.subscriptions,t),()=>this.remove(t)
  }
  remove(t) {
    Om(this.subscriptions,t)
  }
  notify(t,n,s) {
    const i=this.subscriptions.length;
    if(i)if(i===1)this.subscriptions[0](t,n,s);
    else for(let l=0;
    l<i;
    l++) {
      const c=this.subscriptions[l];
      c&&c(t,n,s)
    }
    
  }
  getSize() {
    return this.subscriptions.length
  }
  clear() {
    this.subscriptions.length=0
  }
  
}
const Fr=e=>e*1e3,Pr=e=>e/1e3,bA=(e,t)=>t?e*(1e3/t):0,yA=(e,t,n)=>(((1-3*n+3*t)*e+(3*n-6*t))*e+3*t)*e,f$=1e-7,m$=12;
function p$(e,t,n,s,i) {
  let l,c,d=0;
  do c=t+(n-t)/2,l=yA(c,s,i)-e,l>0?n=c:t=c;
  while(Math.abs(l)>f$&&++d<m$);
  return c
}
function Rd(e,t,n,s) {
  if(e===t&&n===s)return ia;
  const i=l=>p$(l,0,1,e,n);
  return l=>l===0||l===1?l:yA(i(l),t,s)
}
const vA=e=>t=>t<=.5?e(2*t)/2:(2-e(2*(1-t)))/2,wA=e=>t=>1-e(1-t),SA=Rd(.33,1.53,.69,.99),Rv=wA(SA),NA=vA(Rv),jA=e=>e>=1?1:(e*=2)<1?.5*Rv(e):.5*(2-Math.pow(2,-10*(e-1))),Dv=e=>1-Math.sin(Math.acos(e)),kA=wA(Dv),_A=vA(Dv),g$=Rd(.42,0,1,1),x$=Rd(0,0,.58,1),Mv=Rd(.42,0,.58,1),b$=e=>Array.isArray(e)&&typeof e[0]!="number",TA=e=>Array.isArray(e)&&typeof e[0]=="number",y$= {
  linear:ia,easeIn:g$,easeInOut:Mv,easeOut:x$,circIn:Dv,circInOut:_A,circOut:kA,backIn:Rv,backInOut:NA,backOut:SA,anticipate:jA
},v$=e=>typeof e=="string",kk=e=> {
  if(TA(e)) {
    dp(e.length===4);
    const[t,n,s,i]=e;
    return Rd(t,n,s,i)
  }
  else if(v$(e))return y$[e];
  return e
},gf=["setup","read","resolveKeyframes","preUpdate","update","preRender","render","postRender"];
function w$(e) {
  let t=new Set,n=new Set,s=!1,i=!1;
  const l=new Set;
  let c= {
    delta:0,timestamp:0,isProcessing:!1
  };
  function d(m) {
    l.has(m)&&(n.add(m),e()),m(c)
  }
  const f= {
    schedule:(m,p=!1,g=!1)=> {
      const S=g&&s?t:n;
      return p&&l.add(m),S.add(m),m
    },cancel:m=> {
      n.delete(m),l.delete(m)
    },process:m=> {
      if(c=m,s) {
        i=!0;
        return
      }
      s=!0;
      const p=t;
      t=n,n=p,t.forEach(d),t.clear(),s=!1,i&&(i=!1,f.process(m))
    }
    
  };
  return f
}
const S$=40;
function EA(e,t) {
  let n=!1,s=!0;
  const i= {
    delta:0,timestamp:0,isProcessing:!1
  },l=()=>n=!0,c=gf.reduce((C,A)=>(C[A]=w$(l),C), {
    
  }), {
    setup:d,read:f,resolveKeyframes:m,preUpdate:p,up

// --- [5] Denuvo Fix Screen & Feedback API/Screen ---
&&(i(n.code),Be.success(e("denuvoFixScreen.prefilledCode", {
  defaultValue:"Đã tự động điền mã kích hoạt cho game!"
})))
},[n?.code,e]);
const[l,c]=w.useState(!1),[d,f]=w.useState(0),[m,p]=w.useState(!1),[g,y]=w.useState(null),[S,v]=w.useState(!1),[N,j]=w.useState(null),[_,k]=w.useState(!1),C=w.useRef(null),A=w.useMemo(()=>[e("denuvoFixScreen.step1"),e("denuvoFixScreen.step2"),e("denuvoFixScreen.step3"),e("denuvoFixScreen.step4")],[e]),U=w.useMemo(()=>[ {
  stepNumber:1,icon:ym,title:e("denuvoFixScreen.quickStep1Title"),desc:e("denuvoFixScreen.quickStep1Desc"),badgeColor:"bg-blue-500/10 text-blue-400 border-blue-500/20"
}, {
  stepNumber:2,icon:Aa,title:e("denuvoFixScreen.quickStep2Title"),desc:e("denuvoFixScreen.quickStep2Desc"),badgeColor:"bg-purple-500/10 text-purple-400 border-purple-500/20"
}, {
  stepNumber:3,icon:uc,title:e("denuvoFixScreen.quickStep3Title"),desc:e("denuvoFixScreen.quickStep3Desc"),badgeColor:"bg-amber-500/10 text-amber-400 border-amber-500/20"
}, {
  stepNumber:4,icon:fn,title:e("denuvoFixScreen.quickStep4Title"),desc:e("denuvoFixScreen.quickStep4Desc"),badgeColor:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
}, {
  stepNumber:5,icon:Un,title:e("denuvoFixScreen.quickStep5Title"),desc:e("denuvoFixScreen.quickStep5Desc"),badgeColor:"bg-rose-500/10 text-rose-400 border-rose-500/20"
}
],[e]),B=w.useMemo(()=>Math.min(Math.floor(d/100*A.length),A.length-1),[d,A.length]),R=w.useCallback(async()=> {
  try {
    const E=await navigator.clipboard.readText();
    E&&(i(E.trim()),Be.success(e("ordersScreen.keyCopied", {
      defaultValue:"Đã dán mã từ clipboard!"
    })))
  }
  catch {
    Be.error(e("common.copyFailed", {
      defaultValue:"Không thể truy cập clipboard!"
    }))
  }
  
},[e]),L=w.useCallback(()=> {
  i(""),y(null)
},[]),$=w.useCallback(()=> {
  if(!s.trim()) {
    Be.error(e("denuvoFixScreen.inputError"));
    return
  }
  v(!0)
},[s,e]),M=w.useCallback(()=> {
  v(!1)
},[]),H=w.useCallback(()=> {
  j(null)
},[]),ae=w.useCallback(()=> {
  k(!0)
},[]),te=w.useCallback(()=> {
  k(!1)
},[]),K=w.useCallback(E=> {
  if(!E||typeof E!="string")return e("denuvoFixScreen.unknownError");
  const F=E.trim();
  return F.includes("处理完成")?e("denuvoFixScreen.successDesc"):F.includes("授权成功")||F.includes("已经授权")?e("denuvoFixScreen.errors.alreadyAuthorized"):F.includes("退款")||F.includes("吊销")||F.includes("异常退款")||F.includes("禁止使用")?e("denuvoFixScreen.errors.revokedRefund"):F.includes("激活码不存在")||F.includes("输入无误")?e("denuvoFixScreen.errors.notFound"):F.includes("输入值不能为空")||F.includes("不能为空")?e("denuvoFixScreen.errors.empty"):F.includes("已被使用")||F.includes("已使用")?e("denuvoFixScreen.errors.used"):F.includes("已过期")||F.includes("过期")?e("denuvoFixScreen.errors.expired"):F.includes("频繁")||F.includes("稍后再试")?e("denuvoFixScreen.errors.rateLimit"):F.includes("上限")||F.includes("限制")||F.includes("超过")?e("denuvoFixScreen.errors.quotaExceeded"):F.includes("订单号不存在")?e("denuvoFixScreen.errors.orderNotFound"):F.includes("系统繁忙")?e("denuvoFixScreen.errors.serverBusy"):F.includes("处理失败")?e("denuvoFixScreen.errors.processFailed"):F.includes("网络连接异常")||F.includes("网络错误")?e("denuvoFixScreen.errors.networkError"):F.includes("无效")||/[\u4e00-\u9fa5]/.test(F)&&(F.includes("không hợp lệ")||F.includes("hết hạn"))?e("denuvoFixScreen.errors.invalid"):F
},[e]),V=w.useCallback(async()=> {
  v(!1),c(!0),p(!0),f(0),y(null);
  let E=0;
  C.current=setInterval(()=> {
    E+=.8,E>=95&&(E=95),f(E)
  },100);
  try {
    const F=await bt.post("/denuvo/fix", {
      code:s.trim()
    }, {
      silent:!0
    });
    C.current&&(clearInterval(C.current),C.current=null),f(100);
    const P=F.data,Y=P?.message;
    if(P?.success===!1) {
      const D=K(Y);
      c(!1),p(!1),y( {
        type:"error",message:D
      }),Be.error(D);
      return
    }
    let q=e("denuvoFixScreen.successDesc");
    Y&&typeof Y=="string"&&(Y.includes("处理完成")||Y.includes("授权成功")||Y.includes("已经授权")?q=e("denuvoFixScreen.successDesc"):q=Y),setTimeout(()=> {
      c(!1),p(!1),y( {
        type:"success",message:q
      }),Be.success(q)
    },600)
  }
  catch(F) {
    C.current&&(clearInterval(C.current),C.current=null),c(!1),p(!1),f(0);
    const P=F?.response?.data?.message,Y=Array.isArray(P)?P.join(", "):P||(F instanceof Error?F.message:e("denuvoFixScreen.unknownError"));
    if(typeof Y=="string"&&Y.includes("处理完成")) {
      const D=e("denuvoFixScreen.successDesc");
      y( {
        type:"success",message:D
      }),Be.success(D);
      return
    }
    const q=K(Y);
    y( {
      type:"error",message:q
    }),Be.error(q)
  }
  
},[s,e,K]);
return w.useEffect(()=> {
  if(!S)return;
  window.__lenis?.stop();
  const E=document.body.style.overflow;
  return document.body.style.overflow="hidden",()=> {
    document.body.style.overflow=E,window.__lenis?.start()
  }
  
},[S]),w.useEffect(()=>()=> {
  C.current&&clearInterval(C.current)
},[]),a.jsxs("div", {
  className:"relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-8 w-full max-w-6xl mx-auto",children:[a.jsxs("div", {
    className:"text-center space-y-3 relative",children:[a.jsx("h1", {
      className:"text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight gradient-text-signature",children:e("denuvoFixScreen.title")
    }),a.jsx("p", {
      className:"text-xs sm:text-sm text-text-muted max-w-2xl mx-auto leading-relaxed",children:e("denuvoFixScreen.subtitle")
    })]
  }),a.jsxs("div", {
    className:"relative overflow-hidden rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-primary/5 space-y-6",children:[a.jsx("div", {
      className:"pointer-events-none absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
    }),a.jsx("div", {
      className:"pointer-events-none absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl"
    }),a.jsxs("div", {
      className:"w-full space-y-3.5",children:[a.jsxs("div", {
        className:"flex items-center justify-between px-1",children:[a.jsxs("label", {
          className:"text-xs sm:text-sm font-bold text-text flex items-center gap-2",children:[a.jsx(Aa, {
            className:"w-4 h-4 text-primary"
          }),a.jsx("span", {
            children:e("denuvoFixScreen.activationCodeLabel")
          })]
        }),a.jsxs("div", {
          className:"flex items-center gap-2",children:[a.jsxs("button", {
            type:"button",onClick:R,className:"text-xs text-primary hover:text-primary-hover font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors",children:[a.jsx(mB, {
              className:"w-3.5 h-3.5"
            }),a.jsx("span", {
              children:e("denuvoFixScreen.pasteCode")
            })]
          }),s&&a.jsxs("button", {
            type:"button",onClick:L,className:"text-xs text-text-muted hover:text-text font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors",children:[a.jsx(Yt, {
              className:"w-3.5 h-3.5"
            }),a.jsx("span", {
              children:e("denuvoFixScreen.clearCode")
            })]
          })]
        })]
      }),a.jsxs("div", {
        className:"relative flex flex-col sm:flex-row items-stretch gap-2 p-1.5 sm:p-2 rounded-2xl bg-background/80 border border-border/80 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner",children:[a.jsxs("div", {
          className:"relative flex-1 flex items-center min-w-0",children:[a.jsx(Aa, {
            className:"w-4 h-4 text-text-muted/60 shrink-0 ml-2.5 sm:ml-3"
          }),a.jsx("input", {
            type:"text",value:s,onChange:E=>i(E.target.value),onKeyDown:E=> {
              E.key==="Enter"&&!l&&$()
            },placeholder:e("denuvoFixScreen.activationCodePlaceholder"),disabled:l,className:"w-full pl-2.5 pr-8 py-2.5 sm:py-3 bg-transparent text-sm text-text placeholder:text-text-muted outline-none font-mono"
          }),s&&a.jsx("button", {
            type:"button",onClick:L,className:"absolute right-2 text-text-muted hover:text-text cursor-pointer p-1",children:a.jsx(Yt, {
              className:"w-4 h-4"
            })
          })]
        }),a.jsx(Ue, {
          type:"button",size:"none",onClick:$,disabled:l||!s.trim(),className:"h-10 sm:h-11 px-6 sm:px-8 rounded-xl font-black text-xs sm:text-sm tracking-wide bg-gradient-to-r from-[#FF1B70] via-[#F06A4F] to-[#F5B85B] text-white shadow-glow-primary hover:shadow-glow-secondary active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shrink-0",children:l?a.jsxs(a.Fragment, {
            children:[a.jsx(D9, {
              className:"w-4 h-4 animate-spin"
            }),a.jsx("span", {
              children:e("denuvoFixScreen.processingBtn")
            })]
          }):a.jsxs(a.Fragment, {
            children:[a.jsx(uc, {
              className:"w-4 h-4 fill-current"
            }),a.jsx("span", {
              children:e("denuvoFixScreen.submitBtn")
            })]
          })
        })]
      }),m&&a.jsxs(ds.div, {
        initial: {
          opacity:0,height:0
        },animate: {
          opacity:1,height:"auto"
        },exit: {
          opacity:0,height:0
        },className:"p-4 sm:p-5 rounded-2xl bg-surface-2/80 border border-primary/30 space-y-3",children:[a.jsxs("div", {
          className:"flex items-center justify-between text-xs sm:text-sm font-bold text-text",children:[a.jsxs("span", {
            className:"flex items-center gap-2 text-primary",children:[a.jsx(O9, {
              className:"w-4 h-4 animate-bounce"
            }),e("denuvoFixScreen.progressTitle")]
          }),a.jsxs("span", {
            className:"font-mono text-primary text-base font-black",children:[Math.floor(d),"%"]
          })]
        }),a.jsx("div", {
          className:"relative h-3 rounded-full bg-background overflow-hidden p-0.5 border border-border",children:a.jsx("div", {
            className:"h-full rounded-full bg-gradient-to-r from-[#FF1B70] via-[#F06A4F] to-[#F5B85B] transition-all duration-150 relative shadow-glow-primary",style: {
              width:`${d}%`
            }
            
          })
        }),a.jsx("div", {
          className:"grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1",children:A.map((E,F)=> {
            const P=d>=100||F<B,Y=F===B&&d<100;
            return a.jsxs("div", {
              className:et("p-2 rounded-xl border text-center transition-all text-xs font-semibold flex items-center justify-center gap-1.5",P?"bg-emerald-500/10 border-emerald-500/30 text-emerald-400":Y?"bg-primary/10 border-primary text-primary shadow-xs":"bg-surface/50 border-border/60 text-text-muted"),children:[P?a.jsx(pn, {
                className:"w-3.5 h-3.5 text-emerald-400 shrink-0"
              }):a.jsx("span", {
                className:"w-4 h-4 rounded-full bg-surface-2 flex items-center justify-center text-[10px] shrink-0",children:F+1
              }),a.jsx("span", {
                className:"truncate",children:E
              })]
            },F)
          })
        })]
      }),g&&a.jsxs(ds.div, {
        initial: {
          opacity:0,y:8
        },animate: {
          opacity:1,y:0
        },className:et("p-3 rounded-xl border text-xs sm:text-sm leading-relaxed flex items-start gap-2.5",g.type==="success"?"bg-emerald-500/10 border-emerald-500/30 text-emerald-300":"bg-rose-500/10 border-rose-500/30 text-rose-300"),children:[g.type==="success"?a.jsx(Sn, {
          className:"w-5 h-5 text-emerald-400 shrink-0 mt-0.5"
        }):a.jsx(cc, {
          className:"w-5 h-5 text-rose-400 shrink-0 mt-0.5"
        }),a.jsx("div", {
          className:"font-semibold break-words flex-1",children:g.message
        })]
      })]
    }),a.jsxs("div", {
      className:"rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-surface to-card p-5 sm:p-6 space-y-4 shadow-xl backdrop-blur-md",children:[a.jsxs("div", {
        className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60",children:[a.jsxs("div", {
          className:"flex items-center gap-2.5",children:[a.jsx("div", {
            className:"p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary",children:a.jsx(fn, {
              className:"w-4 h-4"
            })
          }),a.jsxs("div", {
            children:[a.jsx("h3", {
              className:"text-sm sm:text-base font-bold text-text",children:e("denuvoFixScreen.quickGuideTitle")
            }),a.jsx("p", {
              className:"text-xs text-text-muted",children:e("denuvoFixScreen.quickGuideSubtitle")
            })]
          })]
        }),a.jsxs("button", {
          type:"button",onClick:ae,className:"text-xs text-primary hover:text-primary-hover font-bold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors",children:[a.jsx(Wi, {
            className:"w-3.5 h-3.5"
          }),a.jsx("span", {
            children:e("libraryScreen.steamOfflineGuide.buttonFull")
          })]
        })]
      }),a.jsxs("div", {
        className:"flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs font-semibold",children:[a.jsx(zy, {
          className:"w-4 h-4 shrink-0 text-amber-500"
        }),a.jsx("span", {
          children:e("denuvoFixScreen.quickGuidePrerequisite")
        })]
      }),a.jsx("div", {
        className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1",children:U.map(E=>a.jsxs("div", {
          className:"relative rounded-xl border border-border/70 bg-surface/80 p-3.5 sm:p-4 flex flex-col justify-between space-y-3 group hover:border-primary/40 transition-colors min-h-[110px]",children:[a.jsxs("div", {
            className:"flex items-center justify-between",children:[a.jsx("div", {
              className:et("w-7 h-7 rounded-lg border flex items-center justify-center font-black text-xs shrink-0 shadow-xs",E.badgeColor),children:E.stepNumber
            }),a.jsx(E.icon, {
              className:"w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0"
            })]
          }),a.jsxs("div", {
            className:"space-y-1",children:[a.jsx("h4", {
              className:"text-xs sm:text-sm font-bold text-text whitespace-nowrap",children:E.title
            }),a.jsx("p", {
              className:"text-[11px] text-text-muted leading-relaxed",children:E.desc
            })]
          })]
        },E.stepNumber))
      })]
    }),a.jsxs("div", {
      className:"space-y-4 pt-2",children:[a.jsxs("h2", {
        className:"text-xs sm:text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2",children:[a.jsx(na, {
          className:"w-4 h-4 text-rose-400"
        }),a.jsxs("span", {
          children:[e("denuvoFixScreen.errorExample1")," & ",e("denuvoFixScreen.errorExample2")]
        })]
      }),a.jsxs("div", {
        className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[a.jsxs("div", {
          className:"rounded-2xl border border-border bg-surface-2/60 p-3 sm:p-4 space-y-2.5",children:[a.jsxs("span", {
            className:"text-xs font-semibold text-text flex items-center gap-1.5",children:[a.jsx("span", {
              className:"w-2 h-2 rounded-full bg-rose-400"
            }),e("denuvoFixScreen.errorExample1")]
          }),a.jsxs("div", {
            className:"relative group rounded-xl overflow-hidden border border-border/80 bg-black/50 cursor-pointer shadow-md",onClick:()=>j( {
              src:e5,alt:e("denuvoFixScreen.errorExample1")
            }),children:[a.jsx("img", {
              src:e5,alt:e("denuvoFixScreen.errorExample1"),className:"w-full object-contain max-h-56 transition-transform duration-300 group-hover:scale-[1.02]"
            }),a.jsxs("div", {
              className:"absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]",children:[a.jsx(Os, {
                className:"w-4 h-4"
              }),a.jsx("span", {
                children:e("denuvoFixScreen.zoomImage")
              })]
            })]
          })]
        }),a.jsxs("div", {
          className:"rounded-2xl border border-border bg-surface-2/60 p-3 sm:p-4 space-y-2.5",children:[a.jsxs("span", {
            className:"text-xs font-semibold text-text flex items-center gap-1.5",children:[a.jsx("span", {
              className:"w-2 h-2 rounded-full bg-rose-400"
            }),e("denuvoFixScreen.errorExample2")]
          }),a.jsxs("div", {
            className:"relative group rounded-xl overflow-hidden border border-border/80 bg-black/50 cursor-pointer shadow-md",onClick:()=>j( {
              src:t5,alt:e("denuvoFixScreen.errorExample2")
            }),children:[a.jsx("img", {
              src:t5,alt:e("denuvoFixScreen.errorExample2"),className:"w-full object-contain max-h-56 transition-transform duration-300 group-hover:scale-[1.02]"
            }),a.jsxs("div", {
              className:"absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]",children:[a.jsx(Os, {
                className:"w-4 h-4"
              }),a.jsx("span", {
                children:e("denuvoFixScreen.zoomImage")
              })]
            })]
          })]
        })]
      })]
    })]
  }),S&&a.jsx("div", {
    "data-lenis-prevent":!0,className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200",onClick:M,children:a.jsxs("div", {
      "data-lenis-prevent":!0,onClick:E=>E.stopPropagation(),className:"w-full max-w-lg bg-card border border-border/80 rounded-2xl p-6 sm:p-7 space-y-5 relative shadow-2xl overscroll-contain animate-in zoom-in-95 duration-150",children:[a.jsxs("div", {
        className:"flex items-start gap-4",children:[a.jsx("div", {
          className:"w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0",children:a.jsx(zy, {
            className:"w-6 h-6 text-amber-500"
          })
        }),a.jsxs("div", {
          className:"space-y-2 flex-1",children:[a.jsx("h3", {
            className:"text-base sm:text-lg font-bold text-text",children:e("denuvoFixScreen.confirmTitle")
          }),a.jsx("p", {
            className:"text-xs sm:text-sm text-text leading-relaxed",children:e("denuvoFixScreen.confirmDesc")
          })]
        })]
      }),a.jsxs("div", {
        className:"space-y-2.5 rounded-xl bg-surface-2/60 border border-border/60 p-4 text-xs sm:text-sm",children:[a.jsxs("div", {
          className:"flex items-start gap-2.5 text-emerald-400 font-medium",children:[a.jsx("span", {
            className:"shrink-0 text-base leading-none",children:"✅"
          }),a.jsx("span", {
            className:"leading-snug",children:e("denuvoFixScreen.confirmOkNotice")
          })]
        }),a.jsxs("div", {
          className:"flex items-start gap-2.5 text-rose-400 font-medium",children:[a.jsx("span", {
            className:"shrink-0 text-base leading-none",children:"❌"
          }),a.jsx("span", {
            className:"leading-snug",children:e("denuvoFixScreen.confirmCancelNotice")
          })]
        })]
      }),a.jsxs("div", {
        className:"flex items-center justify-end gap-3 pt-2",children:[a.jsx(Ue, {
          type:"button",variant:"outline",size:"none",onClick:M,className:"px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer border-border hover:bg-surface-2",children:e("denuvoFixScreen.confirmCancel")
        }),a.jsx(Ue, {
          type:"button",size:"none",onClick:V,className:"px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 cursor-pointer active:scale-95 transition-all",children:e("denuvoFixScreen.confirmOk")
        })]
      })]
    })
  }),a.jsx(sw, {
    children:N&&a.jsx(ds.div, {
      initial: {
        opacity:0
      },animate: {
        opacity:1
      },exit: {
        opacity:0
      },onClick:H,className:"fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out",children:a.jsxs(ds.div, {
        initial: {
          scale:.92,opacity:0
        },animate: {
          scale:1,opacity:1
        },exit: {
          scale:.92,opacity:0
        },transition: {
          duration:.18
        },onClick:E=>E.stopPropagation(),className:"relative max-w-5xl max-h-[92vh] bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-2xl p-2",children:[a.jsx("button", {
          type:"button",onClick:H,className:"absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/70 hover:bg-black text-white transition-colors cursor-pointer",children:a.jsx(Yt, {
            className:"w-5 h-5"
          })
        }),a.jsx("img", {
          src:N.src,alt:N.alt,className:"w-full h-auto max-h-[86vh] object-contain rounded-xl"
        })]
      })
    })
  }),a.jsx(W4, {
    isOpen:_,onClose:te
  })]
})
};
var Ob,n5;
function Y4() {
  if(n5)return Ob;
  n5=1;
  function e(t) {
    var n=typeof t;
    return t!=null&&(n=="object"||n=="function")
  }
  return Ob=e,Ob
}
var Rb,s5;
function gW() {
  if(s5)return Rb;
  s5=1;
  var e=typeof Jh=="object"&&Jh&&Jh.Object===Object&&Jh;
  return Rb=e,Rb
}
var Db,r5;
function Z4() {
  if(r5)return Db;
  r5=1;
  var e=gW(),t=typeof self=="object"&&self&&self.Object===Object&&self,n=e||t||Function("return this")();
  return Db=n,Db
}
var Mb,a5;
function xW() {
  if(a5)return Mb;
  a5=1;
  var e=Z4(),t=function() {
    return e.Date.now()
  };
  return Mb=t,Mb
}
var Lb,i5;
function bW() {
  if(i5)return Lb;
  i5=1;
  var e=/\s/;
  function t(n) {
    for(var s=n.length;
    s--&&e.test(n.charAt(s));
    );
    return s
  }
  return Lb=t,Lb
}
var Pb,o5;
function yW() {
  if(o5)return Pb;
  o5=1;
  var e=bW(),t=/^\s+/;
  function n(s) {
    return s&&s.slice(0,e(s)+1).replace(t,"")
  }
  return Pb=n,Pb
}
var zb,l5;
function X4() {
  if(l5)return zb;
  l5=1;
  var e=Z4(),t=e.Symbol;
  return zb=t,zb
}
var Fb,c5;
function vW() {
  if(c5)return Fb;
  c5=1;
  var e=X4(),t=Object.prototype,n=t.hasOwnProperty,s=t.toString,i=e?e.toStringTag:void 0;
  function l(c) {
    var d=n.call(c,i),f=c[i];
    try {
      c[i]=void 0;
      var m=!0
    }
    catch {
      
    }
    var p=s.call(c);
    return m&&(d?c[i]=f:delete c[i]),p
  }
  return Fb=l,Fb
}
var Ib,u5;
function wW() {
  if(u5)return Ib;
  u5=1;
  var e=Object.prototype,t=e.toString;
  function n(s) {
    return t.call(s)
  }
  return Ib=n,Ib
}
var Bb,d5;
function SW() {
  if(d5)return Bb;
  d5=1;
  var e=X4(),t=vW(),n=wW(),s="[object Null]",i="[object Undefined]",l=e?e.toStringTag:void 0;
  function c(d) {
    return d==null?d===void 0?i:s:l&&l in Object(d)?t(d):n(d)
  }
  return Bb=c,Bb
}
var Ub,h5;
function NW() {
  if(h5)return Ub;
  h5=1;
  function e(t) {
    return t!=null&&typeof t=="object"
  }
  return Ub=e,Ub
}
var Vb,f5;
function jW() {
  if(f5)return Vb;
  f5=1;
  var e=SW(),t=NW(),n="[object Symbol]";
  function s(i) {
    return typeof i=="symbol"||t(i)&&e(i)==n
  }
  return Vb=s,Vb
}
var $b,m5;
function kW() {
  if(m5)return $b;
  m5=1;
  var e=yW(),t=Y4(),n=jW(),s=NaN,i=/^[-+]0x[0-9a-f]+$/i,l=/^0b[01]+$/i,c=/^0o[0-7]+$/i,d=parseInt;
  function f(m) {
    if(typeof m=="number")return m;
    if(n(m))return s;
    if(t(m)) {
      var p=typeof m.valueOf=="function"?m.valueOf():m;
      m=t(p)?p+"":p
    }
    if(typeof m!="string")return m===0?m:+m;
    m=e(m);
    var g=l.test(m);
    return g||c.test(m)?d(m.slice(2),g?2:8):i.test(m)?s:+m
  }
  return $b=f,$b
}
var Hb,p5;
function _W() {
  if(p5)return Hb;
  p5=1;
  var e=Y4(),t=xW(),n=kW(),s="Expected a function",i=Math.max,l=Math.min;
  function c(d,f,m) {
    var p,g,y,S,v,N,j=0,_=!1,k=!1,C=!0;
    if(typeof d!="function")throw new TypeError(s);
    f=n(f)||0,e(m)&&(_=!!m.leading,k="maxWait"in m,y=k?i(n(m.maxWait)||0,f):y,C="trailing"in m?!!m.trailing:C);
    function A(te) {
      var K=p,V=g;
      return p=g=void 0,j=te,S=d.apply(V,K),S
    }
    function U(te) {
      return j=te,v=setTimeout(L,f),_?A(te):S
    }
    function B(te) {
      var K=te-N,V=te-j,E=f-K;
      return k?l(E,y-V):E
    }
    function R(te) {
      var K=te-N,V=te-j;
      return N===void 0||K>=f||K<0||k&&V>=y
    }
    function L() {
      var te=t();
      if(R(te))return $(te);
      v=setTimeout(L,B(te))
    }
    function $(te) {
      return v=void 0,C&&p?A(te):(p=g=void 0,S)
    }
    function M() {
      v!==void 0&&clearTimeout(v),j=0,p=N=g=v=void 0
    }
    function H() {
      return v===void 0?S:$(t())
    }
    function ae() {
      var te=t(),K=R(te);
      if(p=arguments,g=this,N=te,K) {
        if(v===void 0)return U(N);
        if(k)return clearTimeout(v),v=setTimeout(L,f),A(N)
      }
      return v===void 0&&(v=setTimeout(L,f)),S
    }
    return ae.cancel=M,ae.flush=H,ae
  }
  return Hb=c,Hb
}
var TW=_W();
const EW=ca(TW),Vm=( {
  options:e,value:t,onChange:n,placeholder:s="Select...",icon:i,prefixLabel:l,className:c,align:d="left",disabled:f=!1,multiple:m=!1
})=> {
  const[p,g]=w.useState(!1),y=w.useRef(null);
  w.useEffect(()=> {
    const k=C=> {
      y.current&&!y.current.contains(C.target)&&g(!1)
    };
    return document.addEventListener("mousedown",k),()=>document.removeEventListener("mousedown",k)
  },[]);
  const S=w.useMemo(()=>Array.isArray(t)?t:t!=null&&t!==0&&t!=="0"?[t]:[],[t]),v=w.useMemo(()=> {
    if(m) {
      if(S.length===0)return s;
      if(S.length===1) {
        const C=e.find(A=>A.value===S[0]);
        return C?C.label:s
      }
      return`${S.length} đã chọn`
    }
    const k=e.find(C=>C.value===t);
    return k?k.label:s
  },[m,S,e,t,s]),N=w.useCallback(k=>m?k===0||k==="0"?S.length===0:S.includes(k):t===k,[m,S,t]),j=w.useCallback(()=> {
    f||g(k=>!k)
  },[f]),_=w.useCallback(k=> {
    if(m)if(k===0||k==="0")n([]);
    else {
      let C;
      S.includes(k)?C=S.filter(A=>A!==k):C=[...S,k],n(C)
    }
    else n(k),g(!1)
  },[m,S,n]);
  return a.jsxs("div", {
    className:et("relative inline-block text-left",p&&"z-[9999]"),ref:y,children:[a.jsxs(Ue, {
      type:"button",variant:"none",size:"none",disabled:f,onClick:j,className:et("flex items-center justify-between gap-2 w-48 sm:w-56 px-3 py-2 rounded-xl bg-background/60 hover:bg-card/80 border border-border/60 hover:border-primary/40 text-text text-xs font-semibold backdrop-blur-md transition-all shadow-xs active:scale-[0.98] cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed",p&&"border-primary/50 ring-2 ring-primary/20",c),children:[a.jsxs("div", {
        className:"flex items-center gap-1.5 min-w-0 flex-1",children:[i&&a.jsx("span", {
          className:"text-primary shrink-0",children:i
        }),l&&a.jsx("span", {
          className:"text-text-muted font-medium shrink-0",children:l
        }),a.jsx("span", {
          className:"font-bold text-text truncate",children:v
        })]
      }),a.jsx(ov, {
        className:et("w-3.5 h-3.5 text-text-muted transition-transform duration-200 shrink-0 ml-0.5",p&&"rotate-180")
      })]
    }),p&&a.jsx("div", {
      "data-lenis-prevent":!0,onWheel:k=>k.stopPropagation(),className:et("absolute top-full mt-2 min-w-full w-max max-w-[280px] max-h-60 overflow-y-auto overscroll-contain rounded-2xl bg-card border border-border shadow-2xl p-1.5 backdrop-blur-2xl z-[9999] font-sans select-none animate-in fade-in zoom-in-95 duration-150 scrollbar-none",d==="right"?"right-0":"left-0"),children:e.map(k=> {
        const C=N(k.value);
        return a.jsxs(Ue, {
          type:"button",variant:"none",size:"none",onClick:()=>_(k.value),className:et("w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left my-0.5",C?"bg-primary/20 text-primary font-extrabold border border-primary/40 shadow-xs":"text-text-muted hover:text-text hover:bg-surface-2 font-medium"),children:[a.jsxs("div", {
            className:"flex items-center gap-2 truncate pr-2",children:[k.icon&&a.jsx("span", {
              className:"shrink-0",children:k.icon
            }),a.jsx("span", {
              className:"truncate",children:k.label
            })]
          }),C&&a.jsx(pn, {
            className:"w-4 h-4 text-[#F59E0B] shrink-0 stroke-[3]"
          })]
        },String(k.value))
      })
    })]
  })
},Cu= {
  getFeedbacks:async e=> {
    try {
      const {
        data:t
      }
      =await bt.get("/feedbacks", {
        params:e
      });
      return t
    }
    catch(t) {
      return console.warn("Failed to fetch feedbacks:",t), {
        data:[],total:0,take:e?.take||10,skip:e?.skip||0
      }
      
    }
    
  },getFeedbackById:async e=> {
    const {
      data:t
    }
    =await bt.get(`/feedbacks/${e}`);
    return t
  },createFeedback:async e=> {
    const {
      data:t
    }
    =await bt.post("/feedbacks",e);
    return t
  },updateFeedback:async(e,t)=> {
    const {
      data:n
    }
    =await bt.patch(`/feedbacks/${e}`,t);
    return n
  },deleteFeedback:async e=> {
    const {
      data:t
    }
    =await bt.delete(`/feedbacks/${e}`);
    return t
  }
  
};
var Zs=(e=>(e.SUGGESTION="SUGGESTION",e.BUG_REPORT="BUG_REPORT",e.GENERAL="GENERAL",e.COMPLAINT="COMPLAINT",e))(Zs|| {
  
}),fr=(e=>(e.OPEN="OPEN",e.IN_PROGRESS="IN_PROGRESS",e.RESOLVED="RESOLVED",e.CLOSED="CLOSED",e))(fr|| {
  
});
const si=10,CW=()=> {
  const {
    t:e
  }
  =Pt(),t=Yn(le=>le.user),n=Yn(le=>le.isAuthenticated),s=w.useMemo(()=>[ {
    value:"ALL",label:e("feedbackScreen.allStatus")
  }, {
    value:fr.OPEN,label:e("feedbackScreen.statusOpen")
  }, {
    value:fr.IN_PROGRESS,label:e("feedbackScreen.statusInProgress")
  }, {
    value:fr.RESOLVED,label:e("feedbackScreen.statusResolved")
  }, {
    value:fr.CLOSED,label:e("feedbackScreen.statusClosed")
  }
  ],[e]),i=w.useMemo(()=>[ {
    value:fr.OPEN,label:`${e("feedbackScreen.adminStatusPrefix")}${e("feedbackScreen.statusOpen")}`
  }, {
    value:fr.IN_PROGRESS,label:`${e("feedbackScreen.adminStatusPrefix")}${e("feedbackScreen.statusInProgress")}`
  }, {
    value:fr.RESOLVED,label:`${e("feedbackScreen.adminStatusPrefix")}${e("feedbackScreen.statusResolved")}`
  }, {
    value:fr.CLOSED,label:`${e("feedbackScreen.adminStatusPrefix")}${e("feedbackScreen.statusClosed")}`
  }
  ],[e]),[l,c]=w.useState([]),[d,f]=w.useState(0),[m,p]=w.useState(1),[g,y]=w.useState(!0),[S,v]=w.useState(!1),[N,j]=w.useState("ALL"),[_,k]=w.useState("ALL"),[C,A]=w.useState(""),[U,B]=w.useState(!1),[R,L]=w.useState(""),[$,M]=w.useState(""),[H,ae]=w.useState(Zs.GENERAL),[te,K]=w.useState(!1),[V,E]=w.useState(null),[F,P]=w.useState(""),[Y,q]=w.useState(!1),D=w.useCallback(async(le,oe,je,$e,Ge=!1)=> {
    Ge?v(!0):y(!0);
    try {
      const St=await Cu.getFeedbacks( {
        take:si,skip:(le-1)*si,keyword:oe.trim()||void 0,type:je!=="ALL"?je:void 0,status:$e!=="ALL"?$e:void 0,onlyRoots:!0
      });
      c(St.data||[]),f(St.total||0)
    }
    catch {
      
    }
    finally {
      y(!1),v(!1)
    }
    
  },[]),X=w.useCallback(EW((le,oe,je,$e)=> {
    D(le,oe,je,$e)
  },350),[D]),fe=w.useCallback((le=!1)=> {
    X.cancel(),D(m,C,N,_,le)
  },[X,D,m,C,N,_]);
  w.useEffect(()=> {
    X(m,C,N,_)
  },[m,C,N,_,X]),w.useEffect(()=>()=> {
    X.cancel()
  },[X]);
  const ue=async le=> {
    if(le.preventDefault(),!n) {
      Be.error("Vui lòng đăng nhập để gửi góp ý!");
      return
    }
    if(!$.trim()) {
      Be.error("Nội dung góp ý không được để trống!");
      return
    }
    K(!0);
    try {
      await Cu.createFeedback( {
        title:R.trim()||void 0,content:$.trim(),type:H
      }),Be.success("Gửi góp ý thành công! Cảm ơn ý kiến của bạn."),L(""),M(""),ae(Zs.GENERAL),B(!1),fe(!0)
    }
    catch {
      
    }
    finally {
      K(!1)
    }
    
  },he=async le=> {
    if(!n) {
      Be.error("Vui lòng đăng nhập để phản hồi!");
      return
    }
    if(!F.trim()) {
      Be.error("Nội dung phản hồi không được để trống!");
      return
    }
    q(!0);
    try {
      const oe=await Cu.createFeedback( {
        content:F.trim(),parentId:le
      });
      Be.success("Đã gửi câu trả lời thành công!"),P(""),E(null),oe?c(je=>je.map($e=>$e.id===le? {
        ...$e,replies:[...$e.replies||[],oe]
      }
      :$e)):fe(!0)
    }
    catch {
      
    }
    finally {
      q(!1)
    }
    
  },ve=async le=> {
    if(window.confirm("Bạn có chắc chắn muốn xóa bài viết góp ý này?"))try {
      await Cu.deleteFeedback(le),Be.success("Đã xóa góp ý thành công!"),c(oe=>oe.filter(je=>je.id!==le)),f(oe=>Math.max(0,oe-1))
    }
    catch {
      
    }
    
  },be=async(le,oe)=> {
    try {
      await Cu.updateFeedback(le.id, {
        status:oe
      }),Be.success("Cập nhật trạng thái thành công!"),c(je=>je.map($e=>$e.id===le.id? {
        ...$e,status:oe
      }
      :$e))
    }
    catch {
      
    }
    
  },Ae=le=> {
    switch(le) {
      case Zs.SUGGESTION:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",children:[a.jsx(U2, {
          className:"w-3 h-3"
        })," Góp ý"]
      });
      case Zs.BUG_REPORT:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20",children:[a.jsx(I2, {
          className:"w-3 h-3"
        })," Báo lỗi"]
      });
      case Zs.COMPLAINT:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20",children:[a.jsx(cc, {
          className:"w-3 h-3"
        })," Khiếu nại"]
      });
      default:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20",children:[a.jsx(vm, {
          className:"w-3 h-3"
        })," Chung"]
      })
    }
    
  },Te=le=> {
    switch(le) {
      case fr.OPEN:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",children:[a.jsx(gr, {
          className:"w-3 h-3"
        })," Mới"]
      });
      case fr.IN_PROGRESS:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",children:[a.jsx(nr, {
          className:"w-3 h-3 animate-spin text-cyan-400"
        })," Đang xử lý"]
      });
      case fr.RESOLVED:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20",children:[a.jsx(Sn, {
          className:"w-3 h-3"
        })," Đã xong"]
      });
      case fr.CLOSED:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20",children:[a.jsx(Yt, {
          className:"w-3 h-3"
        })," Đã đóng"]
      })
    }
    
  },Ve=le=>le?new Date(le).toLocaleString("vi-VN", {
    hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit",year:"numeric"
  }):"";
  return a.jsxs("div", {
    className:"w-full pb-8",children:[a.jsxs("div", {
      className:"relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-surface to-background border border-primary/20 p-6 sm:p-8 mb-8 shadow-xl",children:[a.jsx("div", {
        className:"absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"
      }),a.jsxs("div", {
        className:"relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6",children:[a.jsxs("div", {
          className:"space-y-2",children:[a.jsxs("div", {
            className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wide uppercase",children:[a.jsx(d9, {
              className:"w-4 h-4"
            })," Hòm Thư Góp Ý (",d,")"]
          }),a.jsx("h1", {
            className:"text-2xl sm:text-3xl font-black text-text tracking-tight",children:"Ý kiến & Đóng góp phát triển"
          }),a.jsx("p", {
            className:"text-sm text-text-muted max-w-xl",children:"Hệ thống lắng nghe trực tiếp từ cộng đồng người chơi. Mọi đóng góp, báo lỗi hay đề xuất tính năng mới đều giúp Deluxe Gaming phục vụ bạn tốt hơn."
          })]
        }),a.jsxs(Ue, {
          onClick:()=>B(!0),className:"shrink-0 gap-2 font-semibold shadow-lg shadow-primary/25 cursor-pointer",children:[a.jsx(cd, {
            className:"w-4 h-4"
          })," Viết góp ý mới"]
        })]
      })]
    }),a.jsxs("div", {
      className:"flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6",children:[a.jsx("div", {
        className:"flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none",children:[ {
          key:"ALL",label:"Tất cả"
        }, {
          key:Zs.SUGGESTION,label:"Góp ý"
        }, {
          key:Zs.BUG_REPORT,label:"Báo lỗi"
        }, {
          key:Zs.COMPLAINT,label:"Khiếu nại"
        }, {
          key:Zs.GENERAL,label:"Khác"
        }
        ].map(le=>a.jsx("button", {
          onClick:()=> {
            j(le.key),p(1)
          },className:et("px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap border",N===le.key?"bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20":"bg-card text-text-muted border-border/60 hover:text-text hover:bg-surface"),children:le.label
        },le.key))
      }),a.jsxs("div", {
        className:"flex items-center gap-2",children:[a.jsx(Vm, {
          options:s,value:_,onChange:le=> {
            k(le),p(1)
          },c

// --- [6] Library Screen (Steam Session & Injection), Store, Product Detail, Catalog, Policies, Auth Screens & Router ---
ncode:function e(t,n) {
  return ZQ(this,t,n, {
    callee:e
  })
},decode:function e(t,n) {
  return XQ(this,t,n, {
    callee:e
  })
},encodeAsync:async function e(t,n) {
  return await QQ(this,t,n, {
    callee:e
  })
},decodeAsync:async function e(t,n) {
  return await JQ(this,t,n, {
    callee:e
  })
},safeEncode(e,t) {
  return eJ(this,e,t)
},safeDecode(e,t) {
  return tJ(this,e,t)
},async safeEncodeAsync(e,t) {
  return nJ(this,e,t)
},async safeDecodeAsync(e,t) {
  return sJ(this,e,t)
},toJSONSchema(e) {
  return _Q(this, {
    
  })(e)
},get description() {
  return Bu.get(this)?.description
},get _def() {
  return this._zod.def
}

}),B3=Oe("_ZodString",(e,t)=> {
  yw.init(e,t),as.init(e,t),e._zod.processJSONSchema=(s,i,l)=>EQ(e,s,i);
  const n=e._zod.bag;
  e.format=n.format??null,e.minLength=n.minimum??null,e.maxLength=n.maximum??null
}, {
  regex(...e) {
    return this.check(uQ(...e))
  },includes(...e) {
    return this.check(fQ(...e))
  },startsWith(...e) {
    return this.check(mQ(...e))
  },endsWith(...e) {
    return this.check(pQ(...e))
  },min(...e) {
    return this.check(Km(...e))
  },max(...e) {
    return this.check(O3(...e))
  },length(...e) {
    return this.check(R3(...e))
  },nonempty(...e) {
    return this.check(Km(1,...e))
  },lowercase(e) {
    return this.check(dQ(e))
  },uppercase(e) {
    return this.check(hQ(e))
  },trim() {
    return this.check(xQ())
  },normalize(...e) {
    return this.check(gQ(...e))
  },toLowerCase() {
    return this.check(bQ())
  },toUpperCase() {
    return this.check(yQ())
  },slugify() {
    return this.check(vQ())
  }
  
}),aJ=Oe("ZodString",(e,t)=> {
  yw.init(e,t),B3.init(e,t)
}, {
  email(e) {
    return this.check(PX(uJ,e))
  },url(e) {
    return this.check(VX(hJ,e))
  },jwt(e) {
    return this.check(sQ(TJ,e))
  },emoji(e) {
    return this.check($X(fJ,e))
  },guid(e) {
    return this.check(zX(dJ,e))
  },uuid(e) {
    return this.check(FX(_f,e))
  },uuidv4(e) {
    return this.check(IX(_f,e))
  },uuidv6(e) {
    return this.check(BX(_f,e))
  },uuidv7(e) {
    return this.check(UX(_f,e))
  },nanoid(e) {
    return this.check(HX(mJ,e))
  },cuid(e) {
    return this.check(qX(pJ,e))
  },cuid2(e) {
    return this.check(GX(gJ,e))
  },ulid(e) {
    return this.check(KX(xJ,e))
  },base64(e) {
    return this.check(eQ(jJ,e))
  },base64url(e) {
    return this.check(tQ(kJ,e))
  },xid(e) {
    return this.check(WX(bJ,e))
  },ksuid(e) {
    return this.check(YX(yJ,e))
  },ipv4(e) {
    return this.check(ZX(vJ,e))
  },ipv6(e) {
    return this.check(XX(wJ,e))
  },cidrv4(e) {
    return this.check(QX(SJ,e))
  },cidrv6(e) {
    return this.check(JX(NJ,e))
  },e164(e) {
    return this.check(nQ(_J,e))
  },datetime(e) {
    return this.check(rQ(iJ,e))
  },date(e) {
    return this.check(aQ(oJ,e))
  },time(e) {
    return this.check(iQ(lJ,e))
  },duration(e) {
    return this.check(oQ(cJ,e))
  }
  
});
function Zi(e) {
  return LX(aJ,e)
}
const On=Oe("ZodStringFormat",(e,t)=> {
  Tn.init(e,t),B3.init(e,t)
}),iJ=Oe("ZodISODateTime",(e,t)=> {
  qZ.init(e,t),On.init(e,t)
}),oJ=Oe("ZodISODate",(e,t)=> {
  GZ.init(e,t),On.init(e,t)
}),lJ=Oe("ZodISOTime",(e,t)=> {
  KZ.init(e,t),On.init(e,t)
}),cJ=Oe("ZodISODuration",(e,t)=> {
  WZ.init(e,t),On.init(e,t)
}),uJ=Oe("ZodEmail",(e,t)=> {
  OZ.init(e,t),On.init(e,t)
}),dJ=Oe("ZodGUID",(e,t)=> {
  CZ.init(e,t),On.init(e,t)
}),_f=Oe("ZodUUID",(e,t)=> {
  AZ.init(e,t),On.init(e,t)
}),hJ=Oe("ZodURL",(e,t)=> {
  zZ.init(e,t),On.init(e,t)
}),fJ=Oe("ZodEmoji",(e,t)=> {
  FZ.init(e,t),On.init(e,t)
}),mJ=Oe("ZodNanoID",(e,t)=> {
  IZ.init(e,t),On.init(e,t)
}),pJ=Oe("ZodCUID",(e,t)=> {
  BZ.init(e,t),On.init(e,t)
}),gJ=Oe("ZodCUID2",(e,t)=> {
  UZ.init(e,t),On.init(e,t)
}),xJ=Oe("ZodULID",(e,t)=> {
  VZ.init(e,t),On.init(e,t)
}),bJ=Oe("ZodXID",(e,t)=> {
  $Z.init(e,t),On.init(e,t)
}),yJ=Oe("ZodKSUID",(e,t)=> {
  HZ.init(e,t),On.init(e,t)
}),vJ=Oe("ZodIPv4",(e,t)=> {
  YZ.init(e,t),On.init(e,t)
}),wJ=Oe("ZodIPv6",(e,t)=> {
  XZ.init(e,t),On.init(e,t)
}),SJ=Oe("ZodCIDRv4",(e,t)=> {
  QZ.init(e,t),On.init(e,t)
}),NJ=Oe("ZodCIDRv6",(e,t)=> {
  eX.init(e,t),On.init(e,t)
}),jJ=Oe("ZodBase64",(e,t)=> {
  tX.init(e,t),On.init(e,t)
}),kJ=Oe("ZodBase64URL",(e,t)=> {
  sX.init(e,t),On.init(e,t)
}),_J=Oe("ZodE164",(e,t)=> {
  rX.init(e,t),On.init(e,t)
}),TJ=Oe("ZodJWT",(e,t)=> {
  iX.init(e,t),On.init(e,t)
}),EJ=Oe("ZodUnknown",(e,t)=> {
  oX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>AQ()
});
function rT() {
  return lQ(EJ)
}
const CJ=Oe("ZodNever",(e,t)=> {
  lX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>CQ(e,n,s)
});
function AJ(e) {
  return cQ(CJ,e)
}
const OJ=Oe("ZodArray",(e,t)=> {
  ww(),cX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>MQ(e,n,s,i),e.element=t.element
}, {
  min(e,t) {
    return this.check(Km(e,t))
  },nonempty(e) {
    return this.check(Km(1,e))
  },max(e,t) {
    return this.check(O3(e,t))
  },length(e,t) {
    return this.check(R3(e,t))
  },unwrap() {
    return this.element
  }
  
});
function RJ(e,t) {
  return wQ(OJ,e,t)
}
const DJ=Oe("ZodObject",(e,t)=> {
  ww(),hX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>LQ(e,n,s,i),kY(e,"shape",n=>n._zod.def.shape,!1)
}, {
  keyof() {
    return FJ(Object.keys(this._zod.def.shape))
  },catchall(e) {
    return this.clone( {
      ...this._zod.def,catchall:e
    })
  },passthrough() {
    return this.clone( {
      ...this._zod.def,catchall:rT()
    })
  },loose() {
    return this.clone( {
      ...this._zod.def,catchall:rT()
    })
  },strict() {
    return this.clone( {
      ...this._zod.def,catchall:AJ()
    })
  },strip() {
    return this.clone( {
      ...this._zod.def,catchall:void 0
    })
  },extend(e) {
    return mY(this,e)
  },safeExtend(e) {
    return pY(this,e)
  },merge(e) {
    return gY(this,e)
  },pick(e) {
    return hY(this,e)
  },omit(e) {
    return fY(this,e)
  },partial(...e) {
    return M5(U3,this,e[0])
  },exactPartial(...e) {
    return M5(V3,this,e[0],"exactPartial")
  },required(...e) {
    return xY($3,this,e[0])
  }
  
});
function Sw(e,t) {
  const n= {
    type:"object",shape:e?? {
      
    },...yt(t)
  };
  return new DJ(n)
}
const MJ=Oe("ZodUnion",(e,t)=> {
  fX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>PQ(e,n,s,i),e.options=t.options
});
function LJ(e,t) {
  return new MJ( {
    type:"union",options:e,...yt(t)
  })
}
const PJ=Oe("ZodIntersection",(e,t)=> {
  mX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>zQ(e,n,s,i)
});
function zJ(e,t) {
  return new PJ( {
    type:"intersection",left:e,right:t
  })
}
const C0=Oe("ZodEnum",(e,t)=> {
  pX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(s,i,l)=>OQ(e,s,i),e.enum=t.entries,e.options=Object.values(t.entries);
  const n=new Set(Object.keys(t.entries));
  e.extract=(s,i)=> {
    const l= {
      
    };
    for(const c of s)if(n.has(c))l[c]=t.entries[c];
    else throw new Error(`Key ${c} not found in enum`);
    return new C0( {
      ...t,checks:[],...yt(i),entries:l
    })
  },e.exclude=(s,i)=> {
    const l= {
      ...t.entries
    };
    for(const c of s)if(n.has(c))delete l[c];
    else throw new Error(`Key ${c} not found in enum`);
    return new C0( {
      ...t,checks:[],...yt(i),entries:l
    })
  }
  
});
function FJ(e,t) {
  const n=Array.isArray(e)?Object.fromEntries(e.map(s=>[s,s])):e;
  return new C0( {
    type:"enum",entries:n,...yt(t)
  })
}
const IJ=Oe("ZodTransform",(e,t)=> {
  ww(),gX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>DQ(e,n,s,i),e._zod.parse=(n,s)=> {
    if(s.direction==="backward")throw new g3(e.constructor.name);
    n.addIssue=l=> {
      if(typeof l=="string")n.issues.push(vd(l,n.value,t));
      else {
        const c=l;
        c.fatal&&(c.continue=!1),c.code??(c.code="custom"),"input"in c||(c.input=n.value),c.inst??(c.inst=e),n.issues.push(vd(c))
      }
      
    };
    const i=t.transform(n.value,n);
    return i instanceof Promise?i.then(l=>(n.value=l,n)):(n.value=i,n)
  }
  
});
function BJ(e) {
  return new IJ( {
    type:"transform",transform:e
  })
}
const U3=Oe("ZodOptional",(e,t)=> {
  C3.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>I3(e,n,s,i),e.unwrap=()=>e._zod.def.innerType
});
function aT(e) {
  return new U3( {
    type:"optional",innerType:e
  })
}
const V3=Oe("ZodExactOptional",(e,t)=> {
  xX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>I3(e,n,s,i),e.unwrap=()=>e._zod.def.innerType
});
function UJ(e) {
  return new V3( {
    type:"optional",innerType:e
  })
}
const VJ=Oe("ZodNullable",(e,t)=> {
  bX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>FQ(e,n,s,i),e.unwrap=()=>e._zod.def.innerType
});
function iT(e) {
  return new VJ( {
    type:"nullable",innerType:e
  })
}
const $J=Oe("ZodDefault",(e,t)=> {
  yX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>BQ(e,n,s,i),e.unwrap=()=>e._zod.def.innerType,e.removeDefault=e.unwrap
});
function HJ(e,t) {
  return new $J( {
    type:"default",innerType:e,get defaultValue() {
      return typeof t=="function"?t():h3(t)
    }
    
  })
}
const qJ=Oe("ZodPrefault",(e,t)=> {
  vX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>UQ(e,n,s,i),e.unwrap=()=>e._zod.def.innerType
});
function GJ(e,t) {
  return new qJ( {
    type:"prefault",innerType:e,get defaultValue() {
      return typeof t=="function"?t():h3(t)
    }
    
  })
}
const $3=Oe("ZodNonOptional",(e,t)=> {
  wX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>IQ(e,n,s,i),e.unwrap=()=>e._zod.def.innerType
});
function KJ(e,t) {
  return new $3( {
    type:"nonoptional",innerType:e,...yt(t)
  })
}
const WJ=Oe("ZodCatch",(e,t)=> {
  SX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>VQ(e,n,s,i),e.unwrap=()=>e._zod.def.innerType,e.removeCatch=e.unwrap
});
function YJ(e,t) {
  return new WJ( {
    type:"catch",innerType:e,catchValue:typeof t=="function"?t:TY(t)
  })
}
const ZJ=Oe("ZodPipe",(e,t)=> {
  NX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>$Q(e,n,s,i),e.in=t.in,e.out=t.out
});
function oT(e,t) {
  return new ZJ( {
    type:"pipe",in:e,out:t
  })
}
const XJ=Oe("ZodReadonly",(e,t)=> {
  jX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>HQ(e,n,s,i),e.unwrap=()=>e._zod.def.innerType
});
function QJ(e) {
  return new XJ( {
    type:"readonly",innerType:e
  })
}
const JJ=Oe("ZodCustom",(e,t)=> {
  kX.init(e,t),as.init(e,t),e._zod.processJSONSchema=(n,s,i)=>RQ(e,n,s,i)
});
function eee(e,t= {
  
}) {
  return SQ(JJ,e,t)
}
function tee(e,t) {
  return NQ(e,t)
}
const nee=Sw( {
  email:Zi().min(1,"emailRequired").max(zr,"emailMaxLength").email("emailInvalid").transform(e=>e.trim().toLowerCase())
}),see=()=> {
  const {
    t:e
  }
  =Pt(),t=ss(),[n,s]=w.useState(!1),[i,l]=w.useState("idle"),[c,d]=w.useState(""), {
    register:f,handleSubmit:m,formState: {
      errors:p
    }
    
  }
  =uw( {
    resolver:dw(nee),mode:"onSubmit",reValidateMode:"onSubmit"
  }),g=w.useCallback(async v=> {
    s(!0),l("idle");
    try {
      await ad.forgotPassword( {
        email:v.email
      }),d(v.email),l("success")
    }
    catch(N) {
      console.error("Forgot password request failed:",N),l("error")
    }
    finally {
      s(!1)
    }
    
  },[]),y=w.useCallback(()=> {
    t("/login")
  },[t]),S=w.useMemo(()=>[ {
    icon:js,label:e("auth.security.genuine")
  }, {
    icon:aa,label:e("auth.security.secure")
  }, {
    icon:uv,label:e("auth.security.support")
  }
  ],[e]);
  return a.jsxs("div", {
    className:"relative w-full max-w-[480px] mx-auto animate-in fade-in zoom-in-95 duration-500",children:[a.jsx("div", {
      className:"absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 rounded-[2.5rem] blur-2xl opacity-70 pointer-events-none"
    }),a.jsxs("div", {
      className:"relative bg-surface/90 dark:bg-surface/80 backdrop-blur-2xl border border-border/80 shadow-2xl shadow-black/20 dark:shadow-black/60 rounded-[2rem] p-7 sm:p-10 overflow-hidden",children:[a.jsx("div", {
        className:"absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      }),i==="success"?a.jsxs("div", {
        className:"text-center py-4",children:[a.jsxs("div", {
          className:"relative w-20 h-20 mx-auto flex items-center justify-center mb-6",children:[a.jsx("div", {
            className:"absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"
          }),a.jsx("div", {
            className:"relative w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center",children:a.jsx(bC, {
              className:"w-10 h-10 text-primary"
            })
          })]
        }),a.jsxs("div", {
          className:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-2",children:[a.jsx(fn, {
            className:"w-3.5 h-3.5"
          }),a.jsx("span", {
            children:e("auth.forgotPassword.badge")
          })]
        }),a.jsx("h2", {
          className:"text-2xl sm:text-3xl font-black text-text tracking-tight mb-2",children:e("auth.forgotPassword.successTitle")
        }),a.jsx("p", {
          className:"text-text-muted font-medium text-xs sm:text-sm max-w-sm mx-auto mb-2",children:e("auth.forgotPassword.successSubtitle")
        }),a.jsx("div", {
          className:"inline-block px-3 py-1.5 rounded-lg bg-surface-2 text-text font-bold text-sm border border-border mb-3 max-w-xs truncate",children:c
        }),a.jsx("p", {
          className:"text-text-muted font-normal text-xs max-w-sm mx-auto mb-7",children:e("auth.forgotPassword.successDesc")
        }),a.jsxs(Ue, {
          type:"button",onClick:y,className:"w-full h-11 sm:h-12 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] hover:brightness-110 active:scale-[0.99] text-white shadow-[0_0_20px_rgba(255,27,112,0.45),0_0_10px_rgba(255,184,0,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer",children:[a.jsx(id, {
            className:"w-4 h-4"
          }),a.jsx("span", {
            children:e("auth.forgotPassword.backToLogin")
          })]
        })]
      }):a.jsxs(a.Fragment, {
        children:[a.jsxs("div", {
          className:"flex flex-col items-center justify-center mb-7 text-center",children:[a.jsxs("div", {
            className:"relative mb-4 flex items-center justify-center",children:[a.jsx("div", {
              className:"absolute w-16 h-16 bg-primary/20 rounded-full blur-xl pointer-events-none"
            }),a.jsx("img", {
              src:"/images/logo.png",alt:"Deluxe Gaming",className:"relative h-11 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
            })]
          }),a.jsxs("div", {
            className:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-2",children:[a.jsx(fn, {
              className:"w-3.5 h-3.5"
            }),a.jsx("span", {
              children:e("auth.forgotPassword.badge")
            })]
          }),a.jsx("h1", {
            className:"text-2xl sm:text-3xl font-black text-text tracking-tight mb-1.5",children:e("auth.forgotPassword.title")
          }),a.jsx("p", {
            className:"text-xs sm:text-sm text-text-muted font-medium max-w-xs",children:e("auth.forgotPassword.subtitle")
          })]
        }),i==="error"&&a.jsxs("div", {
          className:"mb-4 flex items-center gap-3 p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300",children:[a.jsx(cc, {
            className:"w-4 h-4 shrink-0"
          }),a.jsx("span", {
            children:e("auth.forgotPassword.errorMessage")
          })]
        }),a.jsxs("form", {
          onSubmit:m(g),className:"space-y-5",noValidate:!0,children:[a.jsxs("div", {
            className:"space-y-1.5",children:[a.jsx("label", {
              className:"text-xs font-bold uppercase tracking-wider text-text-muted",children:e("auth.forgotPassword.emailLabel")
            }),a.jsxs("div", {
              className:"relative group",children:[a.jsx("div", {
                className:"absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors",children:a.jsx(el, {
                  className:"w-4 h-4"
                })
              }),a.jsx("input", {
                type:"email",...f("email"),placeholder:e("auth.forgotPassword.emailPlaceholder"),className:"w-full bg-surface-2/40 hover:bg-surface-2/70 focus:bg-surface-2 border border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 pl-10 pr-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-text placeholder:text-text-muted/60 outline-none transition-all duration-200"
              })]
            }),p.email&&a.jsxs("p", {
              className:"flex items-center gap-1.5 text-xs text-destructive font-medium mt-1 animate-in fade-in",children:[a.jsx("span", {
                children:"•"
              }),a.jsx("span", {
                children:e(`auth.forgotPassword.validation.${p.email.message}`, {
                  max:zr
                })
              })]
            })]
          }),a.jsx(Ue, {
            type:"submit",disabled:n,className:"w-full h-11 sm:h-12 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] hover:brightness-110 active:scale-[0.99] text-white shadow-[0_0_20px_rgba(255,27,112,0.45),0_0_10px_rgba(255,184,0,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2",children:n?a.jsxs(a.Fragment, {
              children:[a.jsx(gn, {
                className:"w-4 h-4 animate-spin"
              }),a.jsx("span", {
                children:e("auth.forgotPassword.submitting")
              })]
            }):a.jsxs(a.Fragment, {
              children:[a.jsx("span", {
                children:e("auth.forgotPassword.submitButton")
              }),a.jsx(Ur, {
                className:"w-4 h-4"
              })]
            })
          }),a.jsx("div", {
            className:"text-center pt-4 border-t border-border/60",children:a.jsxs("button", {
              type:"button",onClick:y,className:"text-sm font-bold text-text-muted hover:text-text transition-colors inline-flex items-center gap-1.5 group mx-auto cursor-pointer",children:[a.jsx(id, {
                className:"w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
              }),e("auth.forgotPassword.backToLogin")]
            })
          })]
        })]
      }),a.jsx("div", {
        className:"mt-6 pt-4 border-t border-border/40 grid grid-cols-3 gap-2 text-center",children:S.map((v,N)=> {
          const j=v.icon;
          return a.jsxs("div", {
            className:"flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-text-muted",children:[a.jsx(j, {
              className:"w-3.5 h-3.5 text-primary shrink-0"
            }),a.jsx("span", {
              className:"truncate max-w-[100px] sm:max-w-none",children:v.label
            })]
          },N)
        })
      })]
    })]
  })
},lT="/assets/denuvo_steam_error-Cmmjhd-3.png",ree=( {
  isOpen:e,onClose:t,gameTitle:n,cdKey:s,digitalAccountInfo:i,deliveredData:l
})=> {
  const {
    t:c
  }
  =Pt(),d=ss(),[f,m]=w.useState(!1),[p,g]=w.useState(null),y=w.useMemo(()=>l&&l.length>0&&l[0]?l[0].trim():s&&s.trim()?s.trim():i&&i.trim()?i.trim():"",[l,s,i]);
  w.useEffect(()=> {
    if(!e)return;
    window.__lenis?.stop();
    const j=document.body.style.overflow;
    return document.body.style.overflow="hidden",()=> {
      document.body.style.overflow=j,window.__lenis?.start()
    }
    
  },[e]);
  const S=w.useCallback(async()=> {
    if(y)try {
      await navigator.clipboard.writeText(y),m(!0),Be.success(c("libraryScreen.keyCopiedSingle", {
        defaultValue:"Đã sao chép key vào clipboard!"
      })),setTimeout(()=>m(!1),2e3)
    }
    catch {
      Be.error(c("common.copyFailed", {
        defaultValue:"Không thể sao chép vào clipboard!"
      }))
    }
    
  },[y,c]),v=w.useCallback(()=> {
    t(),d("/denuvo-fix", {
      state: {
        code:y,gameTitle:n||""
      }
      
    })
  },[d,t,y,n]),N=w.useCallback(()=> {
    g(null)
  },[]);
  return a.jsx(sw, {
    children:e&&a.jsxs("div", {
      className:"fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto",children:[a.jsx(ds.div, {
        initial: {
          opacity:0
        },animate: {
          opacity:1
        },exit: {
          opacity:0
        },transition: {
          duration:.2
        },onClick:t,className:"fixed inset-0 bg-black/80 backdrop-blur-md"
      }),a.jsxs(ds.div, {
        initial: {
          opacity:0,scale:.94,y:16
        },animate: {
          opacity:1,scale:1,y:0
        },exit: {
          opacity:0,scale:.94,y:16
        },transition: {
          type:"spring",damping:25,stiffness:300
        },className:"relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-amber-500/30 bg-[#0d1117] text-text shadow-2xl shadow-amber-950/30 overflow-hidden z-10",children:[a.jsxs("div", {
          className:"flex items-start justify-between p-5 border-b border-border/80 bg-gradient-to-r from-amber-500/10 via-surface to-surface shrink-0",children:[a.jsxs("div", {
            className:"flex items-center gap-3",children:[a.jsx("div", {
              className:"w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs shadow-amber-500/20",children:a.jsx(na, {
                className:"w-5 h-5 text-amber-400"
              })
            }),a.jsxs("div", {
              children:[a.jsxs("div", {
                className:"flex items-center gap-2",children:[a.jsx("h3", {
                  className:"text-base sm:text-lg font-bold text-text",children:c("libraryScreen.denuvoModal.title")
                }),a.jsx("span", {
                  className:"text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 tracking-wider",children:c("libraryScreen.denuvoModal.badge")
                })]
              }),a.jsx("p", {
                className:"text-xs text-text-muted mt-0.5",children:c("libraryScreen.denuvoModal.subtitle")
              })]
            })]
          }),a.jsx("button", {
            type:"button",onClick:t,className:"p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer",title:c("common.buttons.close"),children:a.jsx(Yt, {
              className:"w-5 h-5"
            })
          })]
        }),a.jsxs("div", {
          className:"p-5 overflow-y-auto space-y-5 custom-scrollbar text-sm",children:[a.jsxs("div", {
            className:"space-y-2.5",children:[a.jsxs("div", {
              className:"flex items-center justify-between text-xs font-semibold text-text-muted",children:[a.jsxs("span", {
                className:"flex items-center gap-1.5",children:[a.jsx(xC, {
                  className:"w-3.5 h-3.5 text-amber-400"
                }),a.jsx("span", {
                  children:c("libraryScreen.denuvoModal.errorTitle")
                })]
              }),a.jsx("span", {
                className:"text-[11px] font-mono text-amber-400/80",children:"Codefusion Anti-Tamper"
              })]
            }),a.jsxs("div", {
              className:"relative group rounded-xl overflow-hidden border border-amber-500/30 bg-black/60 cursor-pointer shadow-lg",onClick:()=>g( {
                src:lT,alt:c("libraryScreen.denuvoModal.errorTitle")
              }),children:[a.jsx("img", {
                src:lT,alt:c("libraryScreen.denuvoModal.errorTitle"),className:"w-full object-contain max-h-56 transition-transform duration-300 group-hover:scale-[1.02]"
              }),a.jsxs("div", {
                className:"absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]",children:[a.jsx(Os, {
                  className:"w-4 h-4 text-amber-400"
                }),a.jsx("span", {
                  children:c("denuvoFixScreen.zoomImage", {
                    defaultValue:"Click để phóng to ảnh"
                  })
                })]
              })]
            }),a.jsxs("div", {
              className:"p-2.5 rounded-lg bg-surface/80 border border-border/80 space-y-1",children:[a.jsx("p", {
                className:"text-xs text-text leading-relaxed font-sans",children:c("libraryScreen.denuvoModal.errorMessage")
              }),a.jsx("div", {
                className:"font-mono text-[11px] text-blue-400 break-all select-all",children:"https://support.codefusion.technology/anti-tamper/?e=88500000&l=english"
              })]
            }),a.jsx("p", {
              className:"text-xs text-text-muted leading-relaxed px-1",children:c("libraryScreen.denuvoModal.errorNotice")
            })]
          }),y&&a.jsxs("div", {
            className:"p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/5 space-y-2",children:[a.jsxs("div", {
              className:"flex items-center justify-between text-xs",children:[a.jsxs("span", {
                className:"font-semibold text-amber-300 flex items-center gap-1.5",children:[a.jsx(Aa, {
                  className:"w-3.5 h-3.5 text-amber-400"
                }),a.jsx("span", {
                  children:c("libraryScreen.denuvoModal.gameKeyLabel")
                })]
              }),a.jsx("button", {
                type:"button",onClick:S,className:"px-2 py-1 rounded-md bg-surface-2 hover:bg-surface border border-border text-[11px] font-semibold text-text flex items-center gap-1 cursor-pointer transition-colors",children:f?a.jsxs(a.Fragment, {
                  children:[a.jsx(pn, {
                    className:"w-3 h-3 text-emerald-400"
                  }),a.jsx("span", {
                    className:"text-emerald-400",children:c("libraryScreen.denuvoModal.copied", {
                      defaultValue:"Đã chép"
                    })
                  })]
                }):a.jsxs(a.Fragment, {
                  children:[a.jsx(Bs, {
                    className:"w-3 h-3 text-text-muted"
                  }),a.jsx("span", {
                    children:c("libraryScreen.denuvoModal.copyKey")
                  })]
                })
              })]
            }),a.jsx("div", {
              className:"font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-border text-primary font-medium select-all truncate",children:y
            }),a.jsx("p", {
              className:"text-[11px] text-text-muted",children:c("libraryScreen.denuvoModal.keyAutoFilled")
            })]
          }),a.jsxs("div", {
            className:"space-y-2.5",children:[a.jsxs("h4", {
              className:"text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5",children:[a.jsx(fn, {
                className:"w-3.5 h-3.5 text-amber-400"
              }),a.jsx("span", {
                children:c("libraryScreen.denuvoModal.howToFixTitle")
              })]
            }),a.jsxs("div", {
              className:"space-y-2 text-xs",children:[a.jsxs("div", {
                className:"flex items-start gap-2.5 p-2.5 rounded-lg bg-surface/60 border border-border/80",children:[a.jsx("span", {
                  className:"w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]",children:"1"
                }),a.jsx("span", {
                  className:"leading-snug text-text",children:c("libraryScreen.denuvoModal.step1")
                })]
              }),a.jsxs("div", {
                className:"flex items-start gap-2.5 p-2.5 rounded-lg bg-surface/60 border border-border/80",children:[a.jsx("span", {
                  className:"w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]",children:"2"
                }),a.jsx("span", {
                  className:"leading-snug text-text",children:c("libraryScreen.denuvoModal.step2")
                })]
              }),a.jsxs("div", {
                className:"flex items-start gap-2.5 p-2.5 rounded-lg bg-surface/60 border border-border/80",children:[a.jsx("span", {
                  className:"w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]",children:"3"
                }),a.jsx("span", {
                  className:"leading-snug text-text",children:c("libraryScreen.denuvoModal.step3")
                })]
              }),a.jsxs("div", {
                className:"flex items-start gap-2.5 p-2.5 rounded-lg bg-surface/60 border border-border/80",children:[a.jsx("span", {
                  className:"w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]",children:"4"
                }),a.jsx("span", {
                  className:"leading-snug text-text",children:c("libraryScreen.denuvoModal.step4")
                })]
              })]
            })]
          })]
        }),a.jsxs("div", {
          className:"p-4 border-t border-border/80 bg-surface/90 flex items-center justify-between gap-3 shrink-0",children:[a.jsx(Ue, {
            type:"button",variant:"ghost",onClick:t,className:"text-xs text-text-muted hover:text-text cursor-pointer",children:c("common.buttons.close")
          }),a.jsxs(Ue, {
            type:"button",onClick:v,className:"bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/25 transition-transform active:scale-95",children:[a.jsx("span", {
              children:c("libraryScreen.denuvoModal.goToDenuvoFix")
            }),a.jsx(Ur, {
              className:"w-4 h-4 text-black"
            })]
          })]
        })]
      }),p&&a.jsx(ds.div, {
        initial: {
          opacity:0
        },animate: {
          opacity:1
        },exit: {
          opacity:0
        },onClick:N,className:"fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out",children:a.jsxs(ds.div, {
          initial: {
            scale:.92,opacity:0
          },animate: {
            scale:1,opacity:1
          },exit: {
            scale:.92,opacity:0
          },transition: {
            duration:.18
          },onClick:j=>j.stopPropagation(),className:"relative max-w-4xl max-h-[92vh] bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-2xl p-2",children:[a.jsx("button", {
            type:"button",onClick:N,className:"absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/70 hover:bg-black text-white transition-colors cursor-pointer",children:a.jsx(Yt, {
              className:"w-5 h-5"
            })
          }),a.jsx("img", {
            src:p.src,alt:p.alt,className:"w-full h-auto max-h-[86vh] object-contain rounded-xl"
          })]
        })
      })]
    })
  })
};
var Ct=(e=>(e.COMPLETED="COMPLETED",e.PENDING="PENDING",e.PROCESSING="PROCESSING",e.ON_HOLD="ON_HOLD",e.PAID="PAID",e.CANCELLED="CANCELLED",e.REFUNDED="REFUNDED",e))(Ct|| {
  
}),Bt=(e=>(e.RANDOM_KEY="RANDOM_KEY",e.RENTAL_ACCOUNT="RENTAL_ACCOUNT",e.EXTERNAL_KEY="EXTERNAL_KEY",e.SINGLE_ACCOUNT="SINGLE_ACCOUNT",e))(Bt|| {
  
}),lm=(e=>(e.IN_STOCK="IN_STOCK",e.OUT_OF_STOCK="OUT_OF_STOCK",e.ON_BACKORDER="ON_BACKORDER",e))(lm|| {
  
});
const Na=e=> {
  if(!e)return[];
  if(Array.isArray(e))return e.map(t=>String(t).trim()).filter(Boolean);
  try {
    const t=JSON.parse(e);
    if(Array.isArray(t))return t.map(n=>String(n).trim()).filter(Boolean);
    if(t&&Array.isArray(t.keys))return t.keys.map(n=>String(n).trim()).filter(Boolean)
  }
  catch {
    
  }
  return e.includes(",")?e.split(",").map(t=>t.trim()).filter(Boolean):e.includes(`
`)?e.split(`
`).map(t=>t.trim()).filter(Boolean):[e.trim()]
},aee= {
  hidden: {
    opacity:0
  },show: {
    opacity:1,transition: {
      staggerChildren:.03,delayChildren:.01
    }
    
  }
  
},iee= {
  hidden: {
    opacity:0,y:12,scale:.98
  },show: {
    opacity:1,y:0,scale:1,transition: {
      duration:.22,ease:[.16,1,.3,1]
    }
    
  }
  
},oee= {
  hidden: {
    opacity:0
  },show: {
    opacity:1,transition: {
      staggerChildren:.025,delayChildren:.01
    }
    
  }
  
},lee= {
  hidden: {
    opacity:0,y:8,scale:.99
  },show: {
    opacity:1,y:0,scale:1,transition: {
      duration:.2,ease:[.16,1,.3,1]
    }
    
  }
  
},cee=()=> {
  const {
    t:e
  }
  =Pt(),t=ss(),[n,s]=w.useState(""),[i,l]=w.useState("grid"),[c,d]=w.useState(null),[f,m]=w.useState(!1),[p,g]=w.useState(null),[y,S]=w.useState(!1),[v,N]=w.useState(null),[j,_]=w.useState(!1),[k,C]=w.useState(null),A=w.useCallback(()=>_(!0),[]),U=w.useCallback(()=>_(!1),[]),B=w.useCallback(G=> {
    C(G)
  },[]),R=w.useCallback(()=> {
    C(null)
  },[]),[L,$]=w.useState("all"), {
    data:M=[],isLoading:H,mutate:ae
  }
  =ci(c?.productId?`/digital-accounts/by-product/${c.productId}`:null,async G=> {
    try {
      const se=await bt.get(G),Le=Array.isArray(se.data)?se.data:se.data?.data||[];
      return Array.isArray(Le)?Le:[]
    }
    catch(se) {
      return console.error("Failed to load accounts for product:",se),[]
    }
    
  }),te=w.useMemo(()=>Array.isArray(M)?M:Array.isArray(M?.data)?M.data:[],[M]),[K,V]=w.useState(null), {
    data:E=[],isLoading:F,isValidating:P,mutate:Y
  }
  =ci(er.LIBRARY,async()=> {
    try {
      const G=await Am.getMyOrders( {
        take:100
      });
      let se=[];
      G&&Array.isArray(G.data)&&G.data.length>0&&(se=G.data);
      const Le=[];
      return se.forEach(Ne=> {
        (Ne.status===Ct.COMPLETED||Ne.status===Ct.PROCESSING||Ne.status===Ct.PAID)&&Ne.items?.forEach((Ke,We)=> {
          const He=Ke.thumbnailUrl||Ke.product?.thumbnail?.url||(Ke.product?.thumbnail?.s3Key?`https://deluxe-gaming.s3.amazonaws.com/${Ke.product.thumbnail.s3Key}`:void 0)||Ke.product?.variants?.[0]?.thumbnail?.url||(Ke.product?.variants?.[0]?.thumbnail?.s3Key?`https://deluxe-gaming.s3.amazonaws.com/${Ke.product.variants[0].thumbnail.s3Key}`:void 0),ot=Ke.fulfillmentType||Ke.product?.fulfillmentType||Ke.product?.variants?.[0]?.fulfillmentType||(Ke.digitalAccountInfo?Bt.SINGLE_ACCOUNT:Bt.EXTERNAL_KEY),Qe=!!(Ke.isDenuvo??Ke.variant?.isDenuvo??Ke.product?.variants?.find(mt=>mt.id===Ke.variantId)?.isDenuvo);
          Le.push( {
            id:`${Ne.id}-${Ke.id||We}`,productId:Ke.productId||Ke.product?.id||null,title:Ke.productTitle||Ke.productName||e("libraryScreen.purchasedGame"),thumbnailUrl:He,orderCode:Ne.orderCode||Ne.code||`DXG-${Ne.id}`,purchasedAt:Ne.createdAt,cdKey:Ke.cdKey,deliveredData:Ke.deliveredData,digitalAccountInfo:Ke.digitalAccountInfo,digitalAccountId:Ke.digitalAccountId||Ke.digitalAccount?.id||null,price:Ke.price||Ke.unitPrice,fulfillmentType:ot,isDenuvo:Qe
          })
        })
      }),Le
    }
    catch(G) {
      return console.error("Failed to load library games:",G),[]
    }
    
  }, {
    revalidateOnFocus:!0,refreshInterval:G=>Array.isArray(G)&&G.some(Le=>Na(Le.deliveredData||Le.cdKey||Le.digitalAccountInfo).length===0)?5e3:0
  }),q=w.useCallback(G=> {
    switch(G) {
      case Bt.SINGLE_ACCOUNT:return {
        label:e("libraryScreen.tabs.SINGLE_ACCOUNT"),icon:js,badgeClass:"bg-blue-500/10 text-blue-400 border-blue-500/20",isKey:!1
      };
      case Bt.RENTAL_ACCOUNT:return {
        label:e("libraryScreen.tabs.RENTAL_ACCOUNT"),icon:gr,badgeClass:"bg-amber-500/10 text-amber-400 border-amber-500/20",isKey:!1
      };
      case Bt.RANDOM_KEY:return {
        label:e("libraryScreen.tabs.RANDOM_KEY"),icon:fn,badgeClass:"bg-purple-500/10 text-purple-400 border-purple-500/20",isKey:!0
      };
      case Bt.EXTERNAL_KEY:default:return {
        label:e("libraryScreen.tabs.EXTERNAL_KEY"),icon:Aa,badgeClass:"bg-primary/10 text-primary border-primary/20",isKey:!0
      }
      
    }
    
  },[e]),D=w.useMemo(()=> {
    const G= {
      all:E.length,[Bt.SINGLE_ACCOUNT]:0,[Bt.RENTAL_ACCOUNT]:0,[Bt.EXTERNAL_KEY]:0,[Bt.RANDOM_KEY]:0
    };
    E.forEach(Ke=> {
      Ke.fulfillmentType&&G[Ke.fulfillmentType]!==void 0&&G[Ke.fulfillmentType]++
    });
    const se= {
      id:"all",label:e("libraryScreen.tabs.all"),icon:Un,count:G.all
    },Ne=[...[ {
      id:Bt.SINGLE_ACCOUNT,label:e("libraryScreen.tabs.SINGLE_ACCOUNT"),icon:js,count:G[Bt.SINGLE_ACCOUNT]
    }, {
      id:Bt.RENTAL_ACCOUNT,label:e("libraryScreen.tabs.RENTAL_ACCOUNT"),icon:gr,count:G[Bt.RENTAL_ACCOUNT]
    }, {
      id:Bt.EXTERNAL_KEY,label:e("libraryScreen.tabs.EXTERNAL_KEY"),icon:Aa,count:G[Bt.EXTERNAL_KEY]
    }, {
      id:Bt.RANDOM_KEY,label:e("libraryScreen.tabs.RANDOM_KEY"),icon:fn,count:G[Bt.RANDOM_KEY]
    }
    ]].sort((Ke,We)=>We.count>0!=Ke.count>0?We.count>0?1:-1:We.count-Ke.count);
    return[se,...Ne]
  },[E,e]);
  w.useEffect(()=> {
    L!=="all"&&!D.some(G=>G.id===L)&&$("all")
  },[D,L]);
  const X=w.useMemo(()=> {
    const G=n.toLowerCase().trim();
    return E.filter(se=> {
      if(L!=="all"&&se.fulfillmentType!==L)return!1;
      if(!G)return!0;
      const Le=Na(se.deliveredData||se.cdKey||se.digitalAccountInfo).join(" ").toLowerCase();
      return se.title.toLowerCase().includes(G)||se.orderCode.toLowerCase().includes(G)||Le.includes(G)
    })
  },[E,L,n]),fe=w.useMemo(()=> {
    if(L!=="all") {
      const G=q(L),se=G.icon;
      return[ {
        id:L,label:G.label,icon:a.jsx(se, {
          className:"w-4 h-4 text-primary"
        }),items:X
      }
      ]
    }
    return D.filter(G=>G.id!=="all").map(G=> {
      const se=q(G.id),Le=se.icon,Ne=X.filter(Ke=>Ke.fulfillmentType===G.id);
      return {
        id:G.id,label:se.label,icon:a.jsx(Le, {
          className:"w-4 h-4 text-primary"
        }),items:Ne
      }
      
    }).filter(G=>G.items.length>0)
  },[L,X,q,D]),ue=w.useCallback(G=> {
    navigator.clipboard.writeText(G),V(G),Be.success(e("ordersScreen.keyCopied")),setTimeout(()=>V(null),2500)
  },[e]),he=w.useCallback(G=> {
    const se=G.join(`
`);
    navigator.clipboard.writeText(se),V(se),Be.success(e("libraryScreen.allKeysCopied", {
      count:G.length
    })),setTimeout(()=>V(null),2500)
  },[e]),ve=w.useRef(null),be=w.useRef(null),[Ae,Te]=w.useState(null);
  w.useEffect(()=>()=> {
    ve.current&&clearInterval(ve.current)
  },[]);
  const Ve=w.useCallback(G=> {
    if(!G)return {
      username:"",password:""
    };
    const se=G.trim();
    if(se.includes("|")) {
      const Le=se.split("|").map(Ne=>Ne.trim());
      return {
        username:Le[0]||"",password:Le[1]||""
      }
      
    }
    if(se.includes(" - ")) {
      const Le=se.split(" - ").map(Ne=>Ne.trim());
      return {
        username:Le[0]||"",password:Le[1]||""
      }
      
    }
    if(se.includes(":")&&!se.startsWith("http")) {
      const[Le,...Ne]=se.split(":");
      return {
        username:Le.trim(),password:Ne.join(":").trim()
      }
      
    }
    return {
      username:se,password:""
    }
    
  },[]),le=w.useCallback(G=> {
    ve.current&&clearInterval(ve.current),be.current=G,ve.current=setInterval(async()=> {
      try {
        await bt.post(`/digital-accounts/${G}/heartbeat`)
      }
      catch(se) {
        console.warn("Heartbeat ping failed:",se)
      }
      
    },3e4)
  },[]),oe=w.useRef(!1),je=w.useCallback(async(G=!1)=> {
    if(!oe.current) {
      oe.current=!0;
      try {
        ve.current&&(clearInterval(ve.current),ve.current=null);
        const se=be.current;
        be.current=null,Te(null);
        const Le=typeof window<"u"&&typeof window.__TAURI_INTERNALS__<"u";
        if(Le&&!G)try {
          await ze("logout_and_close_steam")
        }
        catch(Ne) {
          console.warn("Failed to close steam:",Ne)
        }
        if(se)try {
          await bt.post(`/digital-accounts/${se}/stop-session`),G?Be.info(e("libraryScreen.steamClosedSessionEnded")):Be.info(e("libraryScreen.sessionStoppedAndSteamClosed"))
        }
        catch(Ne) {
          console.warn("Failed to stop session:",Ne)
        }
        else Le&&(G?Be.info(e("libraryScreen.steamClosedSessionEnded")):Be.info(e("libraryScreen.sessionStoppedAndSteamClosed")))
      }
      finally {
        oe.current=!1
      }
      
    }
    
  },[e]);
  w.useEffect(()=> {
    if(!Ae||!(typeof window<"u"&&typeof window.__TAURI_INTERNALS__<"u"))return;
    let se=!1,Le=0,Ne=0,Ke=!1;
    const We=setInterval(async()=> {
      if(!Ke)try {
        let He=!1;
        try {
          He=await ze("is_steam_running")
        }
        catch {
          He=!!(await ze("check_steam_login_status"))?.running
        }
        if(Ke)return;
        He?(se=!0,Le=0):se?(Le++,Le>=2&&(clearInterval(We),console.log("Steam process closed by user. Auto-terminating session."),await je(!0),ae())):(Ne++,Ne>=8&&(clearInterval(We),console.warn("Steam was not detected running within grace period. Ending session."),await je(!0),ae()))
      }
      catch(He) {
        console.warn("Failed to check steam status:",He)
      }
      
    },2e3);
    return()=> {
      Ke=!0,clearInterval(We)
    }
    
  },[Ae,je,ae]);
  const $e=w.useCallback(async(G,se=!0)=> {
    if(G.fulfillmentType===Bt.RANDOM_KEY||G.fulfillmentType===Bt.EXTERNAL_KEY||!G.fulfillmentType&&!G.digitalAccountInfo) {
      if(!(typeof window<"u"&&typeof window.__TAURI_INTERNALS__<"u")) {
        Be.info(e("steamSetup.injectNoTauri")||"This feature is only available in the desktop app.");
        return
      }
      g(G.id);
      const Ke=Be.loading(e(se?"libraryScreen.restartingSteam":"libraryScreen.openingSteam"));
      try {
        const We=await ze("open_steam_and_check_login", {
          restart:se
        });
        if(Be.dismiss(Ke),!We.installed) {
          Be.error(e("libraryScreen.steamNotInstalled"));
          return
        }
        if(!We.logged_in) {
          Be.warning(e("libraryScreen.steamNotLoggedIn"), {
            duration:6e3
          }),N(G),S(!0);
          return
        }
        S(!1),N(null),d(G);
        const He=Na(G.deliveredData||G.cdKey||G.digitalAccountInfo);
        if(He.length>0) {
          const ot=He[0];
          try {
            await navigator.clipboard.writeText(ot),V(ot)
          }
          catch(Qe) {
            console.warn("Failed to copy key to clipboard automatically:",Qe)
          }
          He.length>1?Be.success(e("libraryScreen.steamActivateMultipleKeys", {
            key:ot,total:He.length
          }), {
            duration:6e3
          }):Be.success(e("libraryScreen.steamActivateReadyWithKey", {
            key:ot
          }), {
            duration:4e3
          })
        }
        else Be.success(e("libraryScreen.steamActivateReady"), {
          duration:6e3
        })
      }
      catch(We) {
        Be.dismiss(Ke),console.error("Steam launch/restart failed:",We)
      }
      finally {
        g(null)
      }
      
    }
    else {
      if(!(typeof window<"u"&&typeof window.__TAURI_INTERNALS__<"u")) {
        Be.info(e("steamSetup.injectNoTauri")||"Tính năng này chỉ khả dụng trên ứng dụng máy tính.");
        return
      }
      if(G.fulfillmentType===Bt.RENTAL_ACCOUNT) {
        d(G);
        return
      }
      const Ke=Na(G.deliveredData||G.cdKey||G.digitalAccountInfo), {
        username:We,password:He
      }
      =Ve(Ke[0]||G.digitalAccountInfo);
      if(!We||!He) {
        Be.info(e("libraryScreen.preparingDelivery"));
        return
      }
      if(Ae===G.id) {
        await je();
        return
      }
      if(Ae&&Ae!==G.id) {
        const Qe=be.current;
        if(ve.current&&(clearInterval(ve.current),ve.current=null),be.current=null,Qe&&Qe!==G.digitalAccountId)try {
          await bt.post(`/digital-accounts/${Qe}/stop-session`)
        }
        catch(mt) {
          console.warn("Failed to stop previous session:",mt)
        }
        
      }
      g(G.id);
      const ot=Be.loading("Đang tự động khởi chạy Steam và đăng nhập...");
      try {
        if(G.digitalAccountId)try {
          await bt.post(`/digital-accounts/${G.digitalAccountId}/start-session`),le(G.digitalAccountId)
        }
        catch(Qe) {
          if(Be.dismiss(ot),Qe?.response?.data?.code==="000009") {
            Be.error("Tài khoản đã đạt giới hạn người chơi đồng thời (5/5). Vui lòng chờ slot trống!");
            return
          }
          
        }
        await ze("login_steam_with_timer", {
          username:We,password:He,remainingSeconds:0
        }),Te(G.id),Be.success("Steam đã mở và tự động đăng nhập an toàn!", {
          id:ot,duration:5e3
        })
      }
      catch(Qe) {
        Be.dismiss(ot),Be.error("Không thể mở Steam: "+(Qe instanceof Error?Qe.message:String(Qe)))
      }
      finally {
        g(null)
      }
      
    }
    
  },[e]),Ge=w.useMemo(()=>c?Na(c.deliveredData||c.cdKey||c.digitalAccountInfo):[],[c]),St=w.useMemo(()=> {
    if(!c||c.fulfillmentType!==Bt.RENTAL_ACCOUNT)return[];
    const G=Ge.length>0?Ge.length:1;
    return Array.from( {
      length:G
    },(se,Le)=>Le+1)
  },[c,Ge]),ge=w.useCallback(async(G,se)=> {
    if(!(typeof window<"u"&&typeof window.__TAURI_INTERNALS__<"u")) {
      Be.info(e("steamSetup.injectNoTauri")||"Tính năng này chỉ khả dụng trên ứng dụng máy tính.");
      return
    }
    const Ne=`${se.id}-${G.id}`;
    if(Ae===Ne) {
      await je(),ae();
      return
    }
    if(G.isFull||G.currentUsers>=(G.maxUsers||5)) {
      Be.error(`Tài khoản đã đạt giới hạn người chơi (${G.currentUsers}/${G.maxUsers||5}). Vui lòng chọn tài khoản khác!`);
      return
    }
    if(Ae&&Ae!==Ne) {
      const We=be.current;
      if(ve.current&&(clearInterval(ve.current),ve.current=null),be.current=null,We&&We!==G.id)try {
        await bt.post(`/digital-accounts/${We}/stop-session`)
      }
      catch(He) {
        console.warn("Failed to stop previous account session:",He)
      }
      
    }
    const Ke=Be.loading("Đang xin cấp slot và khởi chạy Steam...");
    try {
      await bt.post(`/digital-accounts/${G.id}/start-session`),le(G.id),Be.loading("Đang tự động khởi chạy Steam và đăng nhập an toàn...", {
        id:Ke
      }),await ze("login_steam_with_timer", {
        username:G.username,password:G.password,remainingSeconds:0
      }),Te(Ne),ae(),Be.success("Steam đã mở và tự động đăng nhập an toàn!", {
        id:Ke,duration:5e3
      })
    }
    catch(We) {
      Be.dismiss(Ke);
      const He=We?.response?.data?.message||(We instanceof Error?We.message:String(We));
      Be.error("Khởi chạy Steam thất bại: "+He)
    }
    
  },[Ae,je,ae,le,e]),Re=w.useCallback(async()=> {
    if(typeof window>"u"||typeof window.__TAURI_INTERNALS__>"u") {
      Be.info(e("steamSetup.injectNoTauri")||"This feature is only available in the desktop app.");
      return
    }
    m(!0);
    const G=Be.loading(e("steamSetup.injecting"));
    try {
      const[se,Le]=await Promise.allSettled([ze("inject_dlls_to_steam"),ze("inject_syctool_to_appdata")]);
      if(se.status==="rejected") {
        const Ke=se.reason instanceof Error?se.reason.message:String(se.reason);
        Be.error(e("steamSetup.injectFailed", {
          message:Ke
        }), {
          id:G,duration:6e3
        });
        return
      }
      const Ne=se.value;
      if(!Ne.steam_found) {
        Be.warning(e("steamSetup.injectNoSteam"), {
          id:G,duration:6e3
        });
        return
      }
      if(Ne.skipped_files.length>0&&Ne.copied_files.length===0) {
        Be.error(e("steamSetup.injectFailed", {
          message:Ne.skipped_files.join(", ")
        }), {
          id:G,duration:6e3
        });
        return
      }
      if(Le.status==="fulfilled") {
        const Ke=Le.value;
        console.info(`[Syctool] inject result: found=${Ke.syctool_found}, copied=${Ke.copied}, failed=${Ke.failed}`)
      }
      else console.error("[Syctool] inject_syctool_to_appdata error:",Le.reason);
      Be.success(e("steamSetup.injectSuccess", {
        count:Ne.copied_files.length
      }), {
        id:G,duration:5e3
      })
    }
    catch(se) {
      const Le=se instanceof Error?se.message:String(se);
      Be.error(e("steamSetup.injectFailed", {
        message:Le
      }), {
        id:G,duration:6e3
      })
    }
    finally {
      m(!1)
    }
    
  },[e]);
  return a.jsxs("div", {
    className:"w-full space-y-5",children:[a.jsxs("div", {
      className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[a.jsxs("div", {
        className:"flex items-center gap-2.5",children:[a.jsx("div", {
          className:"w-1.5 h-6 rounded-full bg-gradient-to-b from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] shadow-[0_0_12px_rgba(255,27,112,0.6)]"
        }),a.jsxs("h1", {
          className:"text-xl font-bold text-text flex items-center gap-2",children:[e("libraryScreen.title"),a.jsx("span", {
            className:"text-xs font-black px-2.5 py-0.5 rounded-md bg-gradient-to-r from-primary/15 via-secondary/15 to-accent/15 border border-primary/30 text-primary dark:text-white tabular-nums",children:E.length
          })]
        })]
      }),a.jsxs("div", {
        className:"flex items-center gap-2",children:[a.jsxs(Ue, {
          type:"button",onClick:Re,disabled:f,className:"h-8 px-3.5 rounded-lg bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/20 hover:from-primary/30 hover:via-secondary/25 hover:to-accent/30 border border-primary/50 hover:border-primary text-text font-bold text-xs transition-all duration-300 shadow-[0_0_15px_rgba(255,27,112,0.25)] hover:shadow-[0_0_22px_rgba(255,27,112,0.45)] hover:scale-[1.02] active:scale-95 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",children:[f?a.jsx(gn, {
            className:"w-3.5 h-3.5 animate-spin text-primary"
          }):a.jsx(ym, {
            className:"w-3.5 h-3.5 text-primary"
          }),a.jsx("span", {
            className:"font-bold text-white",children:e(f?"steamSetup.injecting":"steamSetup.injectBtn")
          })]
        }),a.jsxs(Ue, {
          type:"button",onClick:()=>Y(),disabled:P,className:"h-8 px-3 rounded-lg bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-text text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(nr, {
            className:et("w-3.5 h-3.5",P&&"animate-spin")
          }),a.jsx("span", {
            children:e("common.buttons.refresh")
          })]
        }),a.jsxs(Ue, {
          type:"button",variant:"gradient",onClick:()=>t("/store"),className:"h-8 px-3.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-glow-primary",children:[a.jsx(no, {
            className:"w-3.5 h-3.5"
          }),a.jsx("span", {
            children:e("libraryScreen.exploreStore")
          })]
        })]
      })]
    }),D.length>0&&a.jsx("div", {
      className:"flex items-center gap-2 overflow-x-auto py-1 scrollbar-none",children:D.map(G=> {
        const se=G.icon,Le=L===G.id;
        return a.jsxs("button", {
          type:"button",onClick:()=>$(G.id),className:et("h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 select-none active:scale-95",Le?"bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] bg-origin-border bg-no-repeat text-white font-black shadow-md shadow-primary/25 dark:shadow-[0_0_18px_rgba(255,27,112,0.45),0_0_10px_rgba(255,184,0,0.3)]":"bg-surface/80 hover:bg-surface-2 border border-border/80 text-text-muted hover:text-text hover:border-primary/40"),children:[a.jsx(se, {
            className:et("w-3.5 h-3.5",Le?"text-white":"text-text-muted")
          }),a.jsx("span", {
            children:G.label
          }),a.jsx("span", {
            className:et("text-[10px] font-black px-1.5 py-0.5 rounded-full tabular-nums",Le?"bg-white/25 text-white shadow-xs":G.count>0?"bg-surface-2 text-text-muted":"bg-surface-2/50 text-text-muted/50"),children:G.count
          }),G.id===Bt.RENTAL_ACCOUNT&&a.jsx("span", {
            role:"button",tabIndex:0,onClick:Ne=> {
              Ne.stopPropagation(),A()
            },title:e("libraryScreen.steamOfflineGuide.buttonFull"),className:et("p-0.5 rounded-md transition-all hover:scale-110",Le?"bg-white/20 text-white hover:bg-white/30":"bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"),children:a.jsx(Wi, {
              className:"w-3 h-3"
            })
          })]
        },G.id)
      })
    }),a.jsxs("div", {
      className:"flex items-center gap-3",children:[a.jsxs("div", {
        className:"flex-1 relative max-w-sm",children:[a.jsx(hi, {
          className:"w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        }),a.jsx("input", {
          type:"text",value:n,onChange:G=>s(G.target.value),placeholder:e("libraryScreen.searchPlaceholder"),className:"w-full pl-9 pr-8 py-2 rounded-lg bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm text-text placeholder:text-text-muted transition-all outline-none"
        }),n&&a.jsx("button", {
          type:"button",onClick:()=>s(""),className:"absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer",children:a.jsx(Yt, {
            className:"w-3.5 h-3.5"
          })
        })]
      }),L===Bt.RENTAL_ACCOUNT&&a.jsxs(Ue, {
        type:"button",variant:"outline",onClick:A,className:"h-9 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-500/60 shadow-xs",children:[a.jsx(Wi, {
          className:"w-3.5 h-3.5 text-amber-400"
        }),a.jsx("span", {
          children:e("libraryScreen.steamOfflineGuide.button")
        })]
      }),a.jsxs("div", {
        className:"flex items-center bg-surface border border-border rounded-lg p-0.5 gap-0.5",children:[a.jsx("button", {
          type:"button",onClick:()=>l("grid"),className:et("p-1.5 rounded-md text-xs transition-colors cursor-pointer",i==="grid"?"bg-primary text-primary-foreground":"text-text-muted hover:text-text"),children:a.jsx(BB, {
            className:"w-4 h-4"
          })
        }),a.jsx("button", {
          type:"button",onClick:()=>l("list"),className:et("p-1.5 rounded-md text-xs transition-colors cursor-pointer",i==="list"?"bg-primary text-primary-foreground":"text-text-muted hover:text-text"),children:a.jsx(e9, {
            className:"w-4 h-4"
          })
        })]
      })]
    }),L===Bt.RENTAL_ACCOUNT&&a.jsxs(ds.div, {
      initial: {
        opacity:0,y:-6
      },animate: {
        opacity:1,y:0
      },className:"relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-surface p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5 backdrop-blur-xs",children:[a.jsxs("div", {
        className:"flex items-start gap-3.5 max-w-2xl",children:[a.jsx("div", {
          className:"w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs",children:a.jsx(Wi, {
            className:"w-5 h-5 text-amber-400"
          })
        }),a.jsxs("div", {
          className:"space-y-1",children:[a.jsxs("div", {
            className:"flex items-center gap-2",children:[a.jsx("h3", {
              className:"text-sm sm:text-base font-bold text-text",children:e("libraryScreen.steamOfflineGuide.bannerTitle")
            }),a.jsx("span", {
              className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30",children:"Denuvo & Offline"
            })]
          }),a.jsx("p", {
            className:"text-xs text-text-muted leading-relaxed",children:e("libraryScreen.steamOfflineGuide.bannerDesc")
          })]
        })]
      }),a.jsxs(Ue, {
        type:"button",onClick:A,className:"shrink-0 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25 cursor-pointer active:scale-95 transition-all",children:[a.jsx(Wi, {
          className:"w-4 h-4"
        }),a.jsx("span", {
          children:e("libraryScreen.steamOfflineGuide.viewGuide")
        })]
      })]
    }),F&&a.jsx("div", {
      className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",children:Array.from( {
        length:4
      }).map((G,se)=>a.jsxs("div", {
        className:"rounded-xl bg-surface p-4 space-y-3 animate-pulse",children:[a.jsx("div", {
          className:"w-full aspect-video bg-surface-2 rounded-lg"
        }),a.jsx("div", {
          className:"h-4 bg-surface-2 rounded w-3/4"
        }),a.jsx("div", {
          className:"h-3 bg-surface-2 rounded w-1/2"
        })]
      },se))
    }),!F&&E.length===0&&a.jsxs("div", {
      className:"text-center py-16 space-y-3",children:[a.jsx(Un, {
        className:"w-10 h-10 text-text-muted mx-auto"
      }),a.jsx("h3", {
        className:"text-base font-semibold text-text",children:e("libraryScreen.empty")
      }),a.jsx("p", {
        className:"text-sm text-text-muted",children:e("libraryScreen.emptyDesc")
      }),a.jsxs(Ue, {
        type:"button",onClick:()=>t("/store"),className:"mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(no, {
          className:"w-4 h-4"
        }),a.jsx("span", {
          children:e("libraryScreen.exploreStore")
        })]
      })]
    }),!F&&E.length>0&&X.length===0&&a.jsxs(ds.div, {
      initial: {
        opacity:0,y:12,scale:.98
      },animate: {
        opacity:1,y:0,scale:1
      },transition: {
        duration:.22,ease:[.16,1,.3,1]
      },className:"text-center py-16 space-y-3",children:[a.jsx(hi, {
        className:"w-10 h-10 text-text-muted mx-auto"
      }),a.jsx("h3", {
        className:"text-base font-semibold text-text",children:e("libraryScreen.noFilteredGames")
      }),a.jsx("p", {
        className:"text-sm text-text-muted",children:e("libraryScreen.clearSearch")
      }),a.jsxs(Ue, {
        type:"button",onClick:()=> {
          s(""),$("all")
        },className:"mt-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-2 border border-border text-text font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(nr, {
          className:"w-3.5 h-3.5"
        }),a.jsx("span", {
          children:e("libraryScreen.clearSearch")
        })]
      })]
    },`empty-${L}`),!F&&X.length>0&&i==="grid"&&a.jsx("div", {
      className:"space-y-8",children:fe.map(G=>a.jsxs("div", {
        className:"space-y-4",children:[L==="all"&&fe.length>1&&a.jsxs(ds.h2, {
          initial: {
            opacity:0,x:-8
          },animate: {
            opacity:1,x:0
          },transition: {
            duration:.2
          },className:"text-sm font-semibold text-text flex items-center gap-2 border-b border-border pb-2",children:[G.icon,a.jsx("span", {
            children:G.label
          }),a.jsx("span", {
            className:"text-[10px] bg-surface-2 px-1.5 py-0.5 rounded-full text-text-muted tabular-nums",children:G.items.length
          })]
        }),a.jsx(ds.div, {
          variants:aee,initial:"hidden",animate:"show",className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",children:G.items.map(se=> {
            const Le=Na(se.deliveredData||se.cdKey||se.digitalAccountInfo),Ne=q(se.fulfillmentType),Ke=Ne.icon,We=Ne.isKey,He=se.fulfillmentType===Bt.RENTAL_ACCOUNT,ot=new Date(se.purchasedAt).toLocaleDateString("vi-VN", {
              year:"numeric",month:"2-digit",day:"2-digit"
            });
            return a.jsxs(ds.div, {
              variants:iee,className:"rounded-xl bg-card border border-border hover:border-primary/30 transition-colors overflow-hidden flex flex-col group",children:[a.jsxs("div", {
                className:"relative aspect-video w-full overflow-hidden bg-surface",children:[se.thumbnailUrl?a.jsx(fi, {
                  src:se.thumbnailUrl,alt:se.title,fallbackTitle:se.title,className:"w-full h-full object-cover"
                }):a.jsx("div", {
                  className:"w-full h-full flex items-center justify-center text-text-muted",children:a.jsx(Un, {
                    className:"w-8 h-8"
                  })
                }),a.jsx("div", {
                  className:"absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                }),a.jsxs("span", {
                  className:"absolute top-2.5 left-2.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/60 text-white/80 backdrop-blur-sm",children:["#",se.orderCode]
                }),se.isDenuvo&&a.jsxs("button", {
                  type:"button",onClick:Qe=> {
                    Qe.stopPropagation(),B(se)
                  },title:e("libraryScreen.denuvoBadgeTooltip"),className:"absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/95 hover:bg-amber-400 text-black font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer z-10",children:[a.jsx(na, {
                    className:"w-3 h-3 text-black shrink-0"
                  }),a.jsx("span", {
                    children:e("libraryScreen.denuvoBadge", {
                      defaultValue:"Denuvo"
                    })
                  })]
                })]
              }),a.jsxs("div", {
                className:"p-3.5 space-y-3 flex-1 flex flex-col",children:[a.jsxs("div", {
                  className:"space-y-1",children:[a.jsxs("h3", {
                    onClick:()=>t(se.productId?`/store/${se.productId}`:"/store"),className:"text-sm font-semibold text-text hover:text-primary transition-colors cursor-pointer line-clamp-1 flex items-center justify-between",children:[a.jsx("span", {
                      className:"truncate",children:se.title
                    }),a.jsx(Ca, {
                      className:"w-3.5 h-3.5 text-text-muted shrink-0"
                    })]
                  }),a.jsxs("div", {
                    className:"flex items-center justify-between text-xs text-text-muted",children:[a.jsx("span", {
                      children:ot
                    }),se.price&&a.jsxs("span", {
                      className:"font-bold bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent",children:[se.price.toLocaleString("vi-VN")," ₫"]
                    })]
                  })]
                }),He?a.jsx("div", {
                  className:"p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20",children:a.jsxs("div", {
                    className:"flex items-center justify-between gap-2",children:[a.jsxs("div", {
                      className:"flex items-center gap-1.5 flex-wrap",children:[a.jsxs("span", {
                        className:"text-xs font-semibold text-amber-300 flex items-center gap-1.5",children:[a.jsx(Gi, {
                          className:"w-3.5 h-3.5 text-amber-400"
                        }),a.jsx("span", {
                          children:Le.length>1?e("libraryScreen.rentalAccountsCount", {
                            count:Le.length
                          }):e("libraryScreen.rentalAccountSingle")
                        })]
                      }),se.isDenuvo&&a.jsxs("button", {
                        type:"button",onClick:Qe=> {
                          Qe.stopPropagation(),B(se)
                        },title:e("libraryScreen.denuvoBadgeTooltip"),className:"text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-md border bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-400 uppercase tracking-wide transition-all cursor-pointer hover:scale-105 active:scale-95",children:[a.jsx(na, {
                          className:"w-3 h-3 text-amber-400 shrink-0"
                        }),a.jsx("span", {
                          children:e("libraryScreen.denuvoBadge", {
                            defaultValue:"Denuvo"
                          })
                        })]
                      })]
                    }),a.jsxs("button", {
                      type:"button",onClick:()=>d(se),className:"px-2 py-1 rounded-md bg-amber-500 text-black hover:bg-amber-400 font-bold text-[11px] transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-xs",children:[a.jsx(oi, {
                        className:"w-3 h-3"
                      }),a.jsx("span", {
                        children:e("common.buttons.details")
                      })]
                    })]
                  })
                }):Le.length>0?a.jsxs("div", {
                  className:"p-2.5 rounded-lg bg-primary/5 border border-primary/15 space-y-2",children:[a.jsx("div", {
                    className:"flex items-center justify-between",children:a.jsxs("div", {
                      className:"flex items-center gap-1.5 flex-wrap",children:[a.jsxs("span", {
                        className:et("text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded-md border",Ne.badgeClass),children:[a.jsx(Ke, {
                          className:"w-3 h-3"
                        }),a.jsx("span", {
                          children:Ne.label
                        })]
                      }),se.isDenuvo&&a.jsxs("button", {
                        type:"button",onClick:Qe=> {
                          Qe.stopPropagation(),B(se)
                        },title:e("libraryScreen.denuvoBadgeTooltip"),className:"text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-md border bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-400 uppercase tracking-wide transition-all cursor-pointer hover:scale-105 active:scale-95",children:[a.jsx(na, {
                          className:"w-3 h-3 text-amber-400 shrink-0"
                        }),a.jsx("span", {
                          children:e("libraryScreen.denuvoBadge", {
                            defaultValue:"Denuvo"
                          })
                        })]
                      })]
                    })
                  }),We?a.jsxs("div", {
                    className:"flex items-center justify-between gap-2",children:[a.jsx("code", {
                      className:"text-xs font-medium text-primary",children:e("libraryScreen.keysAvailable", {
                        count:Le.length
                      })
                    }),a.jsxs("button", {
                      type:"button",onClick:()=>d(se),className:"px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover font-medium text-[11px] transition-colors shrink-0 flex items-center gap-1 cursor-pointer",children:[a.jsx(oi, {
                        className:"w-3 h-3"
                      }),a.jsx("span", {
                        children:e("common.buttons.view")
                      })]
                    })]
                  }):a.jsxs("div", {
                    className:"flex items-center justify-between gap-2",children:[a.jsx("code", {
                      className:"text-xs font-mono text-primary truncate max-w-[160px] select-all",children:Le[0]
                    }),a.jsxs("button", {
                      type:"button",onClick:()=>ue(Le[0]),className:"px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover font-medium text-[11px] transition-colors shrink-0 flex items-center gap-1 cursor-pointer",children:[K===Le[0]?a.jsx(pn, {
                        className:"w-3 h-3"
                      }):a.jsx(Bs, {
                        className:"w-3 h-3"
                      }),a.jsx("span", {
                        children:e("libraryScreen.copyKey")
                      })]
                    })]
                  })]
                }):a.jsxs("div", {
                  className:"p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5",children:[a.jsx(gr, {
                    className:"w-3.5 h-3.5 animate-spin",style: {
                      animationDuration:"3s"
                    }
                    
                  }),a.jsx("span", {
                    children:e("libraryScreen.preparingDelivery")
                  })]
                }),a.jsxs("div", {
                  className:"pt-1 flex items-center gap-2 mt-auto",children:[He?a.jsx(Ue, {
                    type:"button",onClick:()=>d(se),className:et("flex-1 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm",Ae&&Ae.startsWith(`${se.id}-`)?"bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700 text-white":"bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-glow-primary"),children:Ae&&Ae.startsWith(`${se.id}-`)?a.jsxs(a.Fragment, {
                      children:[a.jsx("span", {
                        className:"w-2 h-2 rounded-full bg-white animate-ping"
                      }),a.jsx("span", {
                        children:e("libraryScreen.currentlyPlaying")
                      })]
                    }):a.jsxs(a.Fragment, {
                      children:[a.jsx(Gi, {
                        className:"w-3.5 h-3.5"
                      }),a.jsx("span", {
                        children:e("libraryScreen.selectAccountToPlay")
                      })]
                    })
                  }):a.jsx(Ue, {
                    type:"button",disabled:p===se.id,onClick:()=>$e(se),className:et("flex-1 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60",Ae===se.id?"bg-red-500 hover:bg-red-600 text-white":"bg-primary text-primary-foreground hover:bg-primary-hover"),children:p===se.id?a.jsxs(a.Fragment, {
                      children:[a.jsx(gn, {
                        className:"w-3.5 h-3.5 animate-spin"
                      }),a.jsx("span", {
                        children:e("libraryScreen.openingSteam")
                      })]
                    }):Ae===se.id?a.jsxs(a.Fragment, {
                      children:[a.jsx("span", {
                        className:"w-2 h-2 rounded-full bg-white animate-ping"
                      }),a.jsx("span", {
                        children:e("libraryScreen.stopPlaying")
                      })]
                    }):a.jsxs(a.Fragment, {
                      children:[a.jsx(nb, {
                        className:"w-3.5 h-3.5 fill-current"
                      }),a.jsx("span", {
                        children:e("libraryScreen.playNow")
                      })]
                    })
                  }),a.jsx("button", {
                    type:"button",onClick:()=>d(se),className:"p-2 rounded-lg bg-surface hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer",title:e(He?"libraryScreen.viewRentalAccounts":"libraryScreen.viewDetails"),children:a.jsx(xC, {
                      className:"w-4 h-4"
                    })
                  })]
                })]
              })]
            },se.id)
          })
        })]
      },G.id))
    },`grid-${L}`),!F&&X.length>0&&i==="list"&&a.jsx("div", {
      className:"space-y-8",children:fe.map(G=>a.jsxs("div", {
        className:"space-y-4",children:[L==="all"&&fe.length>1&&a.jsxs(ds.h2, {
          initial: {
            opacity:0,x:-8
          },animate: {
            opacity:1,x:0
          },transition: {
            duration:.2
          },className:"text-sm font-semibold text-text flex items-center gap-2 border-b border-border pb-2",children:[G.icon,a.jsx("span", {
            children:G.label
          }),a.jsx("span", {
            className:"text-[10px] bg-surface-2 px-1.5 py-0.5 rounded-full text-text-muted tabular-nums",children:G.items.length
          })]
        }),a.jsx(ds.div, {
          variants:oee,initial:"hidden",animate:"show",className:"space-y-2",children:G.items.map(se=> {
            const Le=Na(se.deliveredData||se.cdKey||se.digitalAccountInfo),Ne=q(se.fulfillmentType),Ke=Ne.icon,We=Ne.isKey,He=se.fulfillmentType===Bt.RENTAL_ACCOUNT,ot=new Date(se.purchasedAt).toLocaleDateString("vi-VN", {
              year:"numeric",month:"2-digit",day:"2-digit"
            });
            return a.jsxs(ds.div, {
              variants:lee,className:"p-3.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group",children:[a.jsxs("div", {
                className:"flex items-center gap-3 min-w-0",children:[a.jsx("div", {
                  className:"w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-surface",children:se.thumbnailUrl?a.jsx(fi, {
                    src:se.thumbnailUrl,alt:se.title,fallbackTitle:se.title,className:"w-full h-full object-cover"
                  }):a.jsx("div", {
                    className:"w-full h-full flex items-center justify-center text-text-muted",children:a.jsx(Un, {
                      className:"w-5 h-5"
                    })
                  })
                }),a.jsxs("div", {
                  className:"min-w-0",children:[a.jsxs("h3", {
                    onClick:()=>t(se.productId?`/store/${se.productId}`:"/store"),className:"text-sm font-medium text-text hover:text-primary transition-colors cursor-pointer truncate flex items-center gap-1",children:[a.jsx("span", {
                      children:se.title
                    }),a.jsx(op, {
                      className:"w-3 h-3 text-text-muted shrink-0"
                    })]
                  }),a.jsxs("div", {
                    className:"flex items-center gap-2 text-xs text-text-muted mt-0.5",children:[a.jsxs("span", {
                      children:["#",se.orderCode]
                    }),a.jsx("span", {
                      children:"·"
                    }),a.jsx("span", {
                      children:ot
                    }),se.isDenuvo&&a.jsxs(a.Fragment, {
                      children:[a.jsx("span", {
                        children:"·"
                      }),a.jsxs("button", {
                        type:"button",onClick:Qe=> {
                          Qe.stopPropagation(),B(se)
                        },title:e("libraryScreen.denuvoBadgeTooltip"),className:"inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer hover:scale-105 active:scale-95",children:[a.jsx(na, {
                          className:"w-3 h-3 text-amber-400 shrink-0"
                        }),a.jsx("span", {
                          children:e("libraryScreen.denuvoBadge", {
                            defaultValue:"Denuvo"
                          })
                        })]
                      })]
                    })]
                  })]
                })]
              }),a.jsxs("div", {
                className:"flex items-center gap-2 self-end md:self-auto",children:[He?a.jsxs("div", {
                  className:"flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20",children:[a.jsxs("span", {
                    className:"text-xs font-semibold text-amber-300 flex items-center gap-1",children:[a.jsx(Gi, {
                      className:"w-3.5 h-3.5 text-amber-400"
                    }),a.jsx("span", {
                      children:Le.length>1?e("libraryScreen.rentalAccountsCount", {
                        count:Le.length
                      }):e("libraryScreen.rentalAccountSingle")
                    })]
                  }),a.jsx("button", {
                    type:"button",onClick:()=>d(se),className:"p-1 rounded bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs transition-colors cursor-pointer ml-1",title:e("common.buttons.details"),children:a.jsx(oi, {
                      className:"w-3.5 h-3.5"
                    })
                  })]
                }):Le.length>0?a.jsxs("div", {
                  className:"flex items-center gap-1.5 bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/15",children:[a.jsxs("span", {
                    className:et("text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded-md border mr-1",Ne.badgeClass),children:[a.jsx(Ke, {
                      className:"w-3 h-3"
                    }),a.jsx("span", {
                      children:Ne.label
                    })]
                  }),We?a.jsxs(a.Fragment, {
                    children:[a.jsx("code", {
                      className:"text-xs font-medium text-primary",children:e("libraryScreen.keysAvailable", {
                        count:Le.length
                      })
                    }),a.jsx("button", {
                      type:"button",onClick:()=>d(se),className:"p-1 rounded bg-primary text-primary-foreground hover:bg-primary-hover text-xs transition-colors cursor-pointer",title:e("common.buttons.view"),children:a.jsx(oi, {
                        className:"w-3.5 h-3.5"
                      })
                    })]
                  }):a.jsxs(a.Fragment, {
                    children:[a.jsx("code", {
                      className:"text-xs font-mono text-primary truncate max-w-[180px] select-all",children:Le[0]
                    }),a.jsx("button", {
                      type:"button",onClick:()=>ue(Le[0]),className:"p-1 rounded bg-primary text-primary-foreground hover:bg-primary-hover text-xs transition-colors cursor-pointer",title:e("libraryScreen.copyKey"),children:K===Le[0]?a.jsx(pn, {
                        className:"w-3.5 h-3.5"
                      }):a.jsx(Bs, {
                        className:"w-3.5 h-3.5"
                      })
                    })]
                  })]
                }):a.jsxs("div", {
                  className:"flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400",children:[a.jsx(gr, {
                    className:"w-3.5 h-3.5 animate-spin",style: {
                      animationDuration:"3s"
                    }
                    
                  }),a.jsx("span", {
                    children:e("libraryScreen.preparingDelivery")
                  })]
                }),He?a.jsx(Ue, {
                  type:"button",onClick:()=>d(se),className:et("px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm",Ae&&Ae.startsWith(`${se.id}-`)?"bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700 text-white":"bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-glow-primary"),children:Ae&&Ae.startsWith(`${se.id}-`)?a.jsxs(a.Fragment, {
                    children:[a.jsx("span", {
                      className:"w-2 h-2 rounded-full bg-white animate-ping"
                    }),a.jsx("span", {
                      children:e("libraryScreen.currentlyPlaying")
                    })]
                  }):a.jsxs(a.Fragment, {
                    children:[a.jsx(Gi, {
                      className:"w-3.5 h-3.5"
                    }),a.jsx("span", {
                      children:e("libraryScreen.selectAccountToPlay")
                    })]
                  })
                }):a.jsx(Ue, {
                  type:"button",disabled:p===se.id,onClick:()=>$e(se),className:et("px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60",Ae===se.id?"bg-red-500 hover:bg-red-600 text-white":"bg-primary text-primary-foreground hover:bg-primary-hover"),children:p===se.id?a.jsxs(a.Fragment, {
                    children:[a.jsx(gn, {
                      className:"w-3.5 h-3.5 animate-spin"
                    }),a.jsx("span", {
                      children:e("libraryScreen.openingSteam")
                    })]
                  }):Ae===se.id?a.jsxs(a.Fragment, {
                    children:[a.jsx("span", {
                      className:"w-2 h-2 rounded-full bg-white animate-ping"
                    }),a.jsx("span", {
                      children:e("libraryScreen.stopPlaying")
                    })]
                  }):a.jsxs(a.Fragment, {
                    children:[a.jsx(nb, {
                      className:"w-3.5 h-3.5 fill-current"
                    }),a.jsx("span", {
                      children:e("libraryScreen.playNow")
                    })]
                  })
                })]
              })]
            },se.id)
          })
        })]
      },G.id))
    },`list-${L}`),c&&a.jsx("div", {
      className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm",children:a.jsxs("div", {
        className:"w-full max-w-lg bg-card border border-border rounded-2xl p-5 space-y-5 relative",children:[a.jsx("button", {
          type:"button",onClick:()=>d(null),className:"absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer z-10","aria-label":e("common.buttons.close"),children:a.jsx(Yt, {
            className:"w-4 h-4"
          })
        }),a.jsxs("div", {
          className:"flex items-start gap-3 pr-10",children:[a.jsx("div", {
            className:"p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5",children:a.jsx(Un, {
              className:"w-5 h-5"
            })
          }),a.jsxs("div", {
            className:"min-w-0 flex-1",children:[a.jsx("h3", {
              className:"text-base font-semibold text-text break-words leading-snug",children:c.title
            }),a.jsxs("div", {
              className:"flex items-center gap-2 mt-1",children:[a.jsxs("p", {
                className:"text-xs text-text-muted",children:["#",c.orderCode]
              }),c.isDenuvo&&a.jsxs("button", {
                type:"button",onClick:G=> {
                  G.stopPropagation(),B(c)
                },title:e("libraryScreen.denuvoBadgeTooltip"),className:"inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer hover:scale-105 active:scale-95",children:[a.jsx(na, {
                  className:"w-3 h-3 text-amber-400 shrink-0"
                }),a.jsx("span", {
                  children:e("libraryScreen.denuvoBadge", {
                    defaultValue:"Denuvo"
                  })
                })]
              })]
            })]
          })]
        }),c.fulfillmentType===Bt.RENTAL_ACCOUNT?a.jsxs("div", {
          className:"p-4 rounded-xl bg-surface space-y-3 border border-amber-500/15",children:[a.jsxs("div", {
            className:"flex items-center justify-between px-0.5",children:[a.jsxs("span", {
              className:"text-xs font-bold text-amber-400 flex items-center gap-1.5",children:[a.jsx(Gi, {
                className:"w-3.5 h-3.5"
              }),a.jsx("span", {
                children:e("libraryScreen.rentalAccountsCount", {
                  count:te.length||St.length
                })
              })]
            }),a.jsxs("button", {
              type:"button",onClick:A,className:"text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer",children:[a.jsx(Wi, {
                className:"w-3.5 h-3.5"
              }),a.jsx("span", {
                children:e("libraryScreen.steamOfflineGuide.button")
              })]
            })]
          }),a.jsx("div", {
            className:"space-y-2.5 max-h-[420px] overflow-y-auto pr-1",children:H?a.jsxs("div", {
              className:"py-6 text-center text-xs text-text-muted flex items-center justify-center gap-2",children:[a.jsx(gn, {
                className:"w-4 h-4 animate-spin text-primary"
              }),a.jsx("span", {
                children:"Đang kiểm tra các slot tài khoản..."
              })]
            }):te.length===0?a.jsx("div", {
              className:"p-4 rounded-xl bg-card border border-border text-center text-xs text-text-muted",children:"Chưa có tài khoản nào sẵn sàng cho game này. Vui lòng liên hệ hỗ trợ."
            }):te.map((G,se)=> {
              const Le=G.isFull||G.currentUsers>=(G.maxUsers||5),Ne=Ae===`${c.id}-${G.id}`;
              return a.jsxs("div", {
                className:et("p-3.5 rounded-xl bg-card border transition-all flex items-center justify-between gap-3 shadow-xs group/acc",Le?"border-red-500/25 bg-red-500/5 opacity-85":"border-border hover:border-amber-500/40"),children:[a.jsxs("div", {
                  className:"flex items-center gap-3 min-w-0",children:[a.jsx("div", {
                    className:et("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-transform",Le?"bg-red-500/10 border-red-500/30 text-red-400":"bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-transparent border-amber-500/30 text-amber-400 group-hover/acc:scale-105"),children:a.jsx(Gi, {
                      className:"w-4 h-4"
                    })
                  }),a.jsxs("div", {
                    className:"min-w-0",children:[a.jsxs("div", {
                      className:"flex items-center gap-2",children:[a.jsx("span", {
                        className:"text-sm font-bold text-text",children:e("libraryScreen.rentalAccountItem", {
                          index:se+1
                        })
                      }),Le&&a.jsxs("span", {
                        className:"inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30",children:[a.jsx("span", {
                          className:"w-1.5 h-1.5 rounded-full bg-red-400"
                        }),"Đầy slot (",G.currentUsers,"/",G.maxUsers,")"]
                      })]
                    }),a.jsxs("p", {
                      className:"text-[11px] text-text-muted mt-0.5 flex items-center gap-1",children:[a.jsx(fn, {
                        className:"w-3 h-3 text-amber-400/80"
                      }),a.jsx("span", {
                        children:e("libraryScreen.rentalAccountProtected")
                      })]
                    })]
                  })]
                }),Ne?a.jsxs(Ue, {
                  type:"button",onClick:async()=> {
                    await je(),ae()
                  },className:"px-3.5 py-1.5 rounded-lg text-white font-bold text-xs bg-red-500 hover:bg-red-600 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0",children:[a.jsx("span", {
                    className:"w-2 h-2 rounded-full bg-white animate-ping"
                  }),a.jsx("span", {
                    children:e("libraryScreen.stopPlaying")
                  })]
                }):Le?a.jsx(Ue, {
                  type:"button",disabled:!0,className:"px-3.5 py-1.5 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs font-bold opacity-60 cursor-not-allowed shrink-0",title:`Tài khoản này đã đạt tối đa số người chơi (${G.currentUsers}/${G.maxUsers})`,children:a.jsxs("span", {
                    children:["Đầy slot (",G.currentUsers,"/",G.maxUsers,")"]
                  })
                }):a.jsxs(Ue, {
                  type:"button",onClick:()=>ge(G,c),className:"px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-sm hover:shadow-glow-primary transition-all flex items-center gap-1.5 cursor-pointer shrink-0",children:[a.jsx(nb, {
                    className:"w-3.5 h-3.5 fill-current"
                  }),a.jsx("span", {
                    children:e("libraryScreen.rentalPlayNow")
                  })]
                })]
              },G.id)
            })
          })]
        }):a.jsxs("div", {
          className:"p-4 rounded-xl bg-surface space-y-3",children:[a.jsxs("div", {
            className:"flex items-center justify-between",children:[(()=> {
              const G=q(c.fulfillmentType),se=G.icon;
              return a.jsx("h4", {
                className:"text-xs font-semibold text-text flex items-center gap-1.5",children:a.jsxs("span", {
                  className:et("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold",G.badgeClass),children:[a.jsx(se, {
                    className:"w-3.5 h-3.5"
                  }),a.jsx("span", {
                    children:G.label
                  })]
                })
              })
            })(),Ge.length>1&&a.jsxs("button", {
              type:"button",onClick:()=>he(Ge),className:"text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer transition-colors",title:e("libraryScreen.copyAllKeys"),children:[K===Ge.join(`
`)?a.jsx(pn, {
                className:"w-3.5 h-3.5 text-green-500"
              }):a.jsx(Bs, {
                className:"w-3.5 h-3.5"
              }),a.jsx("span", {
                children:e("libraryScreen.copyAll")
              })]
            })]
          }),Ge.length>0?a.jsx("div", {
            className:"space-y-2 max-h-[300px] overflow-y-auto pr-1",children:Ge.map((G,se)=>a.jsxs("div", {
              className:"p-3 rounded-lg bg-card border border-border flex items-center justify-between gap-3 group/key hover:border-primary/30 transition-colors",children:[a.jsx("div", {
                className:"font-mono text-xs text-primary break-all select-all flex-1",children:G
              }),a.jsx("button", {
                type:"button",onClick:()=>ue(G),className:"p-2 rounded-md bg-surface hover:bg-surface-2 text-text-muted hover:text-text transition-colors shrink-0 cursor-pointer",title:e("libraryScreen.copyKey"),children:K===G?a.jsx(pn, {
                  className:"w-4 h-4 text-green-500"
                }):a.jsx(Bs, {
                  className:"w-4 h-4"
                })
              })]
            },se))
          }):a.jsx("p", {
            className:"text-xs text-text-muted",children:e("libraryScreen.waitingDelivery")
          })]
        }),a.jsx("div", {
          className:"flex justify-end",children:a.jsx(Ue, {
            type:"button",onClick:()=>d(null),className:"px-4 py-2 rounded-lg bg-surface hover:bg-surface-2 text-sm font-medium text-text-muted hover:text-text transition-colors cursor-pointer",children:e("common.buttons.close")
          })
        })]
      })
    }),y&&a.jsx("div", {
      className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200",children:a.jsxs("div", {
        className:"w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-5 relative shadow-2xl",children:[a.jsxs("div", {
          className:"flex items-start gap-4",children:[a.jsx("div", {
            className:"w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0",children:a.jsx(cc, {
              className:"w-6 h-6 text-amber-500"
            })
          }),a.jsxs("div", {
            className:"space-y-1.5 flex-1",children:[a.jsx("h3", {
              className:"text-base font-bold text-text",children:e("libraryScreen.steamWarningTitle")
            }),a.jsx("p", {
              className:"text-xs text-text-muted leading-relaxed",children:e("libraryScreen.steamWarningDesc")
            })]
          })]
        }),a.jsxs("div", {
          className:"flex items-center justify-end gap-2 pt-2",children:[a.jsx(Ue, {
            type:"button",variant:"outline",onClick:()=> {
              S(!1),N(null)
            },className:"px-4 py-2 rounded-xl text-xs font-semibold hover:bg-surface-2 transition-colors cursor-pointer",children:e("common.buttons.close")
          }),v&&a.jsx(Ue, {
            type:"button",onClick:()=> {
              const G=v;
              S(!1),$e(G,!1)
            },className:"px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition-colors cursor-pointer",children:e("libraryScreen.recheckAndOpen")
          })]
        })]
      })
    }),a.jsx(W4, {
      isOpen:j,onClose:U
    }),a.jsx(ree, {
      isOpen:!!k,onClose:R,gameTitle:k?.title,cdKey:k?.cdKey,digitalAccountInfo:k?.digitalAccountInfo,deliveredData:k?.deliveredData
    })]
  })
},uee=Sw( {
  email:Zi().min(1,"emailRequired").max(zr,"emailMaxLength").email("emailInvalid").transform(e=>e.trim().toLowerCase()),password:Zi().min(6,"passwordMinLength").max(zr,"passwordMaxLength")
}),dee=()=> {
  const {
    t:e
  }
  =Pt(),t=ss(),n=Yn(_=>_.setAuth),[s,i]=w.useState(!1),[l,c]=w.useState(!1),[d,f]=w.useState(!1), {
    register:m,handleSubmit:p,formState: {
      errors:g
    }
    
  }
  =uw( {
    resolver:dw(uee),mode:"onSubmit",reValidateMode:"onSubmit"
  }),y=w.useCallback(async _=> {
    c(!0);
    try {
      const k=await ad.login( {
        email:_.email,password:_.password
      });
      k&&k.accessToken&&(n(k.user,k.accessToken,k.refreshToken),f(!0),setTimeout(()=> {
        t("/store")
      },800))
    }
    catch(k) {
      console.error("Login failed:",k)
    }
    finally {
      c(!1)
    }
    
  },[t,n]),S=w.useCallback(()=> {
    i(_=>!_)
  },[]),v=w.useCallback(()=> {
    t("/forgot-password")
  },[t]),N=w.useCallback(()=> {
    t("/register")
  },[t]),j=w.useMemo(()=>[ {
    icon:js,label:e("auth.security.genuine")
  }, {
    icon:aa,label:e("auth.security.secure")
  }, {
    icon:uv,label:e("auth.security.support")
  }
  ],[e]);
  return a.jsxs("div", {
    className:"relative w-full max-w-[480px] mx-auto animate-in fade-in zoom-in-95 duration-500",children:[a.jsx("div", {
      className:"absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 rounded-[2.5rem] blur-2xl opacity-70 pointer-events-none"
    }),a.jsxs("div", {
      className:"relative bg-surface/90 dark:bg-surface/80 backdrop-blur-2xl border border-border/80 shadow-2xl shadow-black/20 dark:shadow-black/60 rounded-[2rem] p-7 sm:p-10 overflow-hidden",children:[a.jsx("div", {
        className:"absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      }),a.jsxs("div", {
        className:"flex flex-col items-center justify-center mb-7 text-center",children:[a.jsxs("div", {
          className:"relative mb-4 flex items-center justify-center",children:[a.jsx("div", {
            className:"absolute w-16 h-16 bg-primary/20 rounded-full blur-xl pointer-events-none"
          }),a.jsx("img", {
            src:"/images/logo.png",alt:"Deluxe Gaming",className:"relative h-11 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
          })]
        }),a.jsxs("div", {
          className:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-2",children:[a.jsx(fn, {
            className:"w-3.5 h-3.5"
          }),a.jsx("span", {
            children:e("auth.login.badge")
          })]
        }),a.jsx("h1", {
          className:"text-2xl sm:text-3xl font-black text-text tracking-tight mb-1.5",children:e("auth.login.title")
        }),a.jsx("p", {
          className:"text-xs sm:text-sm text-text-muted font-medium max-w-xs",children:e("auth.login.subtitle")
        })]
      }),a.jsxs("form", {
        onSubmit:p(y),className:"space-y-5",noValidate:!0,children:[d&&a.jsxs("div", {
          className:"flex items-center gap-3 p-3.5 rounded-xl bg-success/10 text-success text-xs font-semibold border border-success/20 animate-in fade-in slide-in-from-top-2 duration-300",children:[a.jsx(Sn, {
            className:"w-4 h-4 shrink-0"
          }),a.jsx("span", {
            children:e("auth.login.successMessage")
          })]
        }),a.jsxs("div", {
          className:"space-y-4",children:[a.jsxs("div", {
            className:"space-y-1.5",children:[a.jsx("label", {
              className:"text-xs font-bold uppercase tracking-wider text-text-muted",children:e("auth.login.emailLabel")
            }),a.jsxs("div", {
              className:"relative group",children:[a.jsx("div", {
                className:"absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors",children:a.jsx(el, {
                  className:"w-4 h-4"
                })
              }),a.jsx("input", {
                type:"email",...m("email"),placeholder:e("auth.login.emailPlaceholder"),className:"w-full bg-surface-2/40 hover:bg-surface-2/70 focus:bg-surface-2 border border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 pl-10 pr-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-text placeholder:text-text-muted/60 outline-none transition-all duration-200"
              })]
            }),g.email&&a.jsxs("p", {
              className:"flex items-center gap-1.5 text-xs text-destructive font-medium mt-1 animate-in fade-in",children:[a.jsx("span", {
                children:"•"
              }),a.jsx("span", {
                children:e(`auth.login.validation.${g.email.message}`, {
                  max:zr,min:6
                })
              })]
            })]
          }),a.jsxs("div", {
            className:"space-y-1.5",children:[a.jsxs("div", {
              className:"flex items-center justify-between",children:[a.jsx("label", {
                className:"text-xs font-bold uppercase tracking-wider text-text-muted",children:e("auth.login.passwordLabel")
              }),a.jsx(Ue, {
                type:"button",variant:"none",size:"none",onClick:v,className:"text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors",children:e("auth.login.forgotPassword")
              })]
            }),a.jsxs("div", {
              className:"relative group flex items-center",children:[a.jsx("div", {
                className:"absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors",children:a.jsx(aa, {
                  className:"w-4 h-4"
                })
              }),a.jsx("input", {
                type:s?"text":"password",...m("password"),placeholder:e("auth.login.passwordPlaceholder"),className:"w-full bg-surface-2/40 hover:bg-surface-2/70 focus:bg-surface-2 border border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 pl-10 pr-11 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-text placeholder:text-text-muted/60 outline-none transition-all duration-200"
              }),a.jsx("button", {
                type:"button",onClick:S,className:"absolute right-3.5 text-text-muted hover:text-text transition-colors p-1",children:s?a.jsx(Ly, {
                  className:"w-4 h-4"
                }):a.jsx(oi, {
                  className:"w-4 h-4"
                })
              })]
            }),g.password&&a.jsxs("p", {
              className:"flex items-center gap-1.5 text-xs text-destructive font-medium mt-1 animate-in fade-in",children:[a.jsx("span", {
                children:"•"
              }),a.jsx("span", {
                children:e(`auth.login.validation.${g.password.message}`, {
                  max:zr,min:6
                })
              })]
            })]
          })]
        }),a.jsx(Ue, {
          type:"submit",disabled:l,className:"w-full h-11 sm:h-12 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] hover:brightness-110 active:scale-[0.99] text-white shadow-[0_0_20px_rgba(255,27,112,0.45),0_0_10px_rgba(255,184,0,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2",children:l?a.jsxs(a.Fragment, {
            children:[a.jsx(gn, {
              className:"w-4 h-4 animate-spin"
            }),a.jsx("span", {
              children:e("auth.login.loggingIn")
            })]
          }):a.jsxs(a.Fragment, {
            children:[a.jsx("span", {
              children:e("auth.login.submitButton")
            }),a.jsx(Ur, {
              className:"w-4 h-4"
            })]
          })
        }),a.jsxs("div", {
          className:"text-center pt-4 border-t border-border/60",children:[a.jsx("p", {
            className:"text-xs text-text-muted font-medium mb-1.5",children:e("auth.login.noAccount")
          }),a.jsxs("button", {
            type:"button",onClick:N,className:"text-sm font-bold text-text hover:text-primary transition-colors inline-flex items-center gap-1.5 group mx-auto cursor-pointer",children:[e("auth.login.signUp"),a.jsx(Ur, {
              className:"w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
            })]
          })]
        })]
      }),a.jsx("div", {
        className:"mt-6 pt-4 border-t border-border/40 grid grid-cols-3 gap-2 text-center",children:j.map((_,k)=> {
          const C=_.icon;
          return a.jsxs("div", {
            className:"flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-text-muted",children:[a.jsx(C, {
              className:"w-3.5 h-3.5 text-primary shrink-0"
            }),a.jsx("span", {
              className:"truncate max-w-[100px] sm:max-w-none",children:_.label
            })]
          },k)
        })
      })]
    })]
  })
},Jb=e=>e.status===Ct.COMPLETED?!0:!e.items||e.items.length===0?!1:e.items.every(t=>Na(t.deliveredData||t.cdKey||t.digitalAccountInfo).length>0),hee=()=> {
  const {
    t:e
  }
  =Pt(),t=ss(),[n,s]=w.useState(""),[i,l]=w.useState("ALL"),[c,d]=w.useState([]),[f,m]=w.useState(null),[p,g]=w.useState(null),[y,S]=w.useState(null), {
    data:v,isLoading:N,isValidating:j,mutate:_
  }
  =ci(er.MY_ORDERS,async()=> {
    try {
      const M=await Am.getMyOrders( {
        take:50,skip:0
      });
      return M&&Array.isArray(M.data)? {
        orders:M.data,totalOrders:M.total??M.data.length
      }
      : {
        orders:[],totalOrders:0
      }
      
    }
    catch(M) {
      return console.error("Failed to load orders:",M), {
        orders:[],totalOrders:0
      }
      
    }
    
  }, {
    revalidateOnFocus:!0,refreshInterval:M=>M?.orders?.some(ae=>ae.status===Ct.PENDING||ae.status===Ct.PROCESSING||ae.status===Ct.PAID?!Jb(ae):!1)?5e3:0
  }),k=v?.orders||[],C=v?.totalOrders||0,A=w.useCallback(M=> {
    d(H=>H.includes(M)?H.filter(ae=>ae!==M):[...H,M])
  },[]),U=w.useCallback(M=> {
    navigator.clipboard.writeText(M),m(M),Be.success(e("ordersScreen.keyCopied")),setTimeout(()=>m(null),2500)
  },[e]),B=w.useCallback(M=> {
    navigator.clipboard.writeText(M),g(M),Be.success(e("ordersScreen.orderCodeCopied")),setTimeout(()=>g(null),2500)
  },[e]),R=w.useMemo(()=>k.filter(M=> {
    const H=M.orderCode||M.code||"",ae=i==="ALL"||M.status===i||i===Ct.PROCESSING&&(M.status===Ct.PENDING||M.status===Ct.PROCESSING||M.status===Ct.ON_HOLD||M.status===Ct.PAID),te=n.toLowerCase().trim(),K=te===""||H.toLowerCase().includes(te)||M.items?.some(V=>(V.productTitle||V.productName||"").toLowerCase().includes(te)||(V.cdKey||"").toLowerCase().includes(te));
    return ae&&K
  }),[k,i,n]),L=w.useMemo(()=> {
    const M=k.filter(E=>E.status===Ct.COMPLETED),H=k.filter(E=>E.status===Ct.PENDING||E.status===Ct.PROCESSING||E.status===Ct.ON_HOLD||E.status===Ct.PAID),ae=M.reduce((E,F)=>E+Number(F.finalAmount??F.totalAmount??0),0),te=H.reduce((E,F)=>E+Number(F.finalAmount??F.totalAmount??0),0),V=k.filter(E=>E.status!==Ct.CANCELLED&&E.status!==Ct.REFUNDED).reduce((E,F)=>E+Number(F.finalAmount??F.totalAmount??0),0);
    return {
      total:k.length,completedCount:M.length,completedSpent:ae,processingCount:H.length,processingSpent:te,totalSpent:V
    }
    
  },[k]),$=w.useCallback((M,H)=> {
    if(M===Ct.COMPLETED||H)return a.jsxs("span", {
      className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",children:[a.jsx(Sn, {
        className:"w-3 h-3"
      }),M===Ct.COMPLETED?e("ordersScreen.statusTypes.COMPLETED"):e("ordersScreen.statusTypes.DELIVERED")]
    });
    switch(M) {
      case Ct.PAID:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400",children:[a.jsx(gr, {
          className:"w-3 h-3"
        }),e("ordersScreen.statusTypes.PAID")]
      });
      case Ct.PROCESSING:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400",children:[a.jsx(gr, {
          className:"w-3 h-3"
        }),e("ordersScreen.statusTypes.PROCESSING")]
      });
      case Ct.PENDING:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400",children:[a.jsx(gr, {
          className:"w-3 h-3"
        }),e("ordersScreen.statusTypes.PENDING")]
      });
      case Ct.ON_HOLD:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400",children:[a.jsx(gr, {
          className:"w-3 h-3"
        }),e("ordersScreen.statusTypes.ON_HOLD")]
      });
      case Ct.CANCELLED:case Ct.REFUNDED:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-500",children:[a.jsx(Mr, {
          className:"w-3 h-3"
        }),M===Ct.REFUNDED?e("ordersScreen.statusTypes.REFUNDED"):e("ordersScreen.statusTypes.CANCELLED")]
      });
      default:return a.jsxs("span", {
        className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-surface-2 text-text-muted",children:[a.jsx(gr, {
          className:"w-3 h-3"
        }),M]
      })
    }
    
  },[e]);
  return a.jsxs("div", {
    className:"w-full space-y-5",children:[a.jsxs("div", {
      className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[a.jsxs("div", {
        className:"flex items-center gap-2.5",children:[a.jsx("div", {
          className:"w-1 h-5 rounded-full bg-primary"
        }),a.jsxs("h1", {
          className:"text-xl font-bold text-text flex items-center gap-2",children:[e("ordersScreen.title"),a.jsx("span", {
            className:"text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary tabular-nums",children:C
          })]
        })]
      }),a.jsxs("div", {
        className:"flex items-center gap-2",children:[a.jsxs(Ue, {
          type:"button",onClick:()=>_(),disabled:j,className:"h-8 px-3 rounded-lg bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-text text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(nr, {
            className:et("w-3.5 h-3.5",j&&"animate-spin")
          }),a.jsx("span", {
            children:e("common.buttons.refresh")
          })]
        }),a.jsxs(Ue, {
          type:"button",onClick:()=>t("/store"),className:"h-8 px-3 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(Un, {
            className:"w-3.5 h-3.5"
          }),a.jsx("span", {
            children:e("ordersScreen.backToStore")
          })]
        })]
      })]
    }),a.jsxs("div", {
      className:"grid grid-cols-2 lg:grid-cols-4 gap-3",children:[a.jsxs("div", {
        className:"p-3.5 rounded-xl bg-card border border-border",children:[a.jsx("span", {
          className:"text-xs text-text-muted",children:e("ordersScreen.totalOrders")
        }),a.jsx("div", {
          className:"text-2xl font-bold text-text mt-1",children:L.total
        })]
      }),a.jsxs("div", {
        className:"p-3.5 rounded-xl bg-card border border-border",children:[a.jsx("span", {
          className:"text-xs text-emerald-600 dark:text-emerald-400",children:e("ordersScreen.statusTypes.COMPLETED")
        }),a.jsx("div", {
          className:"text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1",children:L.completedCount
        }),a.jsx("span", {
          className:"text-[11px] text-text-muted",children:a.jsx(Fs, {
            locales:"vi-VN",value:L.completedSpent,format: {
              style:"currency",currency:"VND",minimumFractionDigits:0
            }
            
          })
        })]
      }),a.jsxs("div", {
        className:"p-3.5 rounded-xl bg-card border border-border",children:[a.jsx("span", {
          className:"text-xs text-amber-600 dark:text-amber-400",children:e("ordersScreen.processingOrHold")
        }),a.jsx("div", {
          className:"text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1",children:L.processingCount
        }),a.jsx("span", {
          className:"text-[11px] text-text-muted",children:a.jsx(Fs, {
            locales:"vi-VN",value:L.processingSpent,format: {
              style:"currency",currency:"VND",minimumFractionDigits:0
            }
            
          })
        })]
      }),a.jsxs("div", {
        className:"p-3.5 rounded-xl bg-card border border-border",children:[a.jsx("span", {
          className:"text-xs text-text-muted",children:e("ordersScreen.totalSpent")
        }),a.jsx("div", {
          className:"text-xl font-bold text-primary mt-1",children:a.jsx(Fs, {
            locales:"vi-VN",value:L.totalSpent,format: {
              style:"currency",currency:"VND",minimumFractionDigits:0
            }
            
          })
        })]
      })]
    }),a.jsxs("div", {
      className:"flex flex-col md:flex-row md:items-center gap-3",children:[a.jsxs("div", {
        className:"flex-1 relative max-w-sm",children:[a.jsx(hi, {
          className:"w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        }),a.jsx("input", {
          type:"text",value:n,onChange:M=>s(M.target.value),placeholder:e("ordersScreen.searchPlaceholder"),className:"w-full pl-9 pr-8 py-2 rounded-lg bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm text-text placeholder:text-text-muted transition-all outline-none"
        }),n&&a.jsx("button", {
          type:"button",onClick:()=>s(""),className:"absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer",children:a.jsx(Yt, {
            className:"w-3.5 h-3.5"
          })
        })]
      }),a.jsx("div", {
        className:"flex flex-wrap items-center gap-1.5",children:[ {
          id:"ALL",label:e("ordersScreen.allStatus")
        }, {
          id:Ct.COMPLETED,label:e("ordersScreen.statusTypes.COMPLETED")
        }, {
          id:Ct.PROCESSING,label:e("ordersScreen.statusTypes.PROCESSING")
        }, {
          id:Ct.CANCELLED,label:e("ordersScreen.statusTypes.CANCELLED")
        }
        ].map(M=>a.jsx("button", {
          type:"button",onClick:()=>l(M.id),className:et("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",i===M.id?"bg-primary/10 text-primary":"text-text-muted hover:text-text hover:bg-surface"),children:M.label
        },M.id))
      })]
    }),N?a.jsx("div", {
      className:"space-y-3",children:Array.from( {
        length:3
      }).map((M,H)=>a.jsxs("div", {
        className:"rounded-xl bg-card border border-border p-5 space-y-3 animate-pulse",children:[a.jsxs("div", {
          className:"flex items-center justify-between",children:[a.jsx("div", {
            className:"w-32 h-4 bg-surface-2 rounded"
          }),a.jsx("div", {
            className:"w-20 h-5 bg-surface-2 rounded-md"
          })]
        }),a.jsx("div", {
          className:"h-16 bg-surface-2 rounded-lg"
        })]
      },H))
    }):R.length===0?a.jsxs("div", {
      className:"text-center py-16 space-y-3",children:[a.jsx(no, {
        className:"w-10 h-10 text-text-muted mx-auto"
      }),a.jsx("h3", {
        className:"text-base font-semibold text-text",children:e("ordersScreen.noOrders")
      }),a.jsx("p", {
        className:"text-sm text-text-muted",children:e("ordersScreen.noOrdersDesc")
      }),a.jsxs(Ue, {
        type:"button",onClick:()=>t("/store"),className:"mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(Un, {
          className:"w-4 h-4"
        }),a.jsx("span", {
          children:e("ordersScreen.backToStore")
        })]
      })]
    }):a.jsx("div", {
      className:"space-y-3",children:R.map(M=> {
        const H=Jb(M),ae=c.includes(M.id),te=M.orderCode||M.code||`DXG-${M.id}`,K=new Date(M.createdAt).toLocaleDateString("vi-VN", {
          year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"
        }),V=Number(M.finalAmount??M.totalAmount??0);
        return a.jsxs("div", {
          className:"rounded-xl bg-card border border-border overflow-hidden",children:[a.jsxs("div", {
            className:"p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[a.jsxs("div", {
              className:"space-y-1",children:[a.jsxs("div", {
                className:"flex flex-wrap items-center gap-2",children:[a.jsxs("div", {
                  className:"flex items-center gap-1 font-mono text-sm font-semibold text-text",children:[a.jsxs("span", {
                    children:["#",te]
                  }),a.jsx("button", {
                    type:"button",onClick:()=>B(te),className:"text-text-muted hover:text-primary transition-colors cursor-pointer",children:p===te?a.jsx(pn, {
                      className:"w-3.5 h-3.5 text-emerald-500"
                    }):a.jsx(Bs, {
                      className:"w-3.5 h-3.5"
                    })
                  })]
                }),$(M.status,H)]
              }),a.jsxs("div", {
                className:"flex flex-wrap items-center gap-2 text-xs text-text-muted",children:[a.jsx("span", {
                  children:K
                }),M.paymentMethod&&a.jsxs(a.Fragment, {
                  children:[a.jsx("span", {
                    children:"·"
                  }),a.jsxs("span", {
                    className:"flex items-center gap-1",children:[a.jsx(lv, {
                      className:"w-3 h-3"
                    }),M.paymentMethod]
                  })]
                })]
              })]
            }),a.jsxs("div", {
              className:"flex items-center gap-3 self-end sm:self-auto",children:[a.jsx("div", {
                className:"text-right",children:a.jsx("span", {
                  className:"text-lg font-bold text-primary tabular-nums",children:a.jsx(Fs, {
                    locales:"vi-VN",value:V,format: {
                      style:"currency",currency:"VND",minimumFractionDigits:0
                    }
                    
                  })
                })
              }),a.jsxs("div", {
                className:"flex items-center gap-1.5",children:[a.jsx("button", {
                  type:"button",onClick:()=>S(M),className:"p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer",title:e("ordersScreen.invoice"),children:a.jsx($2, {
                    className:"w-4 h-4"
                  })
                }),a.jsxs("button", {
                  type:"button",onClick:()=>A(M.id),className:"px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer flex items-center gap-1",children:[a.jsx("span", {
                    children:e(ae?"ordersScreen.hideDetails":"ordersScreen.viewDetails")
                  }),ae?a.jsx(iB, {
                    className:"w-3.5 h-3.5"
                  }):a.jsx(ov, {
                    className:"w-3.5 h-3.5"
                  })]
                })]
              })]
            })]
          }),a.jsx("div", {
            className:"px-4 pb-4 space-y-2",children:M.items?.map((E,F)=> {
              const P=E.productTitle||E.productName||e("ordersScreen.gameProduct"),q=Na(E.deliveredData||E.cdKey||E.digitalAccountInfo).join(", ");
              return a.jsxs("div", {
                className:"flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg bg-surface",children:[a.jsxs("div", {
                  className:"flex items-center gap-3 min-w-0",children:[a.jsx("div", {
                    className:"w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-surface-2",children:E.thumbnailUrl?a.jsx(fi, {
                      src:E.thumbnailUrl,alt:P,fallbackTitle:P,className:"w-full h-full object-cover"
                    }):a.jsx("div", {
                      className:"w-full h-full flex items-center justify-center text-text-muted",children:a.jsx(Un, {
                        className:"w-4 h-4"
                      })
                    })
                  }),a.jsxs("div", {
                    className:"min-w-0",children:[a.jsxs("h4", {
                      className:"text-sm font-medium text-text truncate hover:text-primary transition-colors cursor-pointer flex items-center gap-1",onClick:()=>t(E.productId?`/store/${E.productId}`:"/store"),children:[a.jsx("span", {
                        children:P
                      }),a.jsx(op, {
                        className:"w-3 h-3 text-text-muted shrink-0"
                      })]
                    }),a.jsxs("div", {
                      className:"flex items-center gap-2 text-xs text-text-muted mt-0.5",children:[a.jsx("span", {
                        children:a.jsx(Fs, {
                          locales:"vi-VN",value:E.price||E.unitPrice||0,format: {
                            style:"currency",currency:"VND",minimumFractionDigits:0
                          }
                          
                        })
                      }),a.jsxs("span", {
                        children:["× ",E.quantity||1]
                      })]
                    })]
                  })]
                }),q&&a.jsxs(Ue, {
                  type:"button",onClick:()=>S(M),className:"px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border border-primary/20",children:[a.jsx(oi, {
                    className:"w-3.5 h-3.5"
                  }),a.jsx("span", {
                    children:e("ordersScreen.viewInfo")
                  })]
                })]
              },E.id||F)
            })
          }),!H&&(M.status===Ct.PAID||M.status===Ct.PROCESSING)&&a.jsxs("div", {
            className:"mx-4 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs",children:[a.jsxs("div", {
              className:"flex items-start gap-2.5",children:[a.jsx(gr, {
                className:"w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-spin",style: {
                  animationDuration:"3s"
                }
                
              }),a.jsxs("div", {
                className:"space-y-0.5",children:[a.jsx("p", {
                  className:"font-semibold text-amber-600 dark:text-amber-400",children:e("ordersScreen.deliveryNoticeTitle")
                }),a.jsx("p", {
                  className:"text-text-muted text-[11px] leading-relaxed",children:e("ordersScreen.deliveryNoticeDesc")
                })]
              })]
            }),a.jsxs("div", {
              className:"flex items-center gap-2 shrink-0 self-end sm:self-auto",children:[a.jsxs(Ue, {
                type:"button",onClick:()=>_(),disabled:j,className:"h-7 px-2.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-medium text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer",children:[a.jsx(nr, {
                  className:et("w-3 h-3",j&&"animate-spin")
                }),a.jsx("span", {
                  children:e("common.buttons.refresh")
                })]
              }),a.jsxs("a", {
                href:Is.ZALO_URL,target:"_blank",rel:"noreferrer",onClick:E=> {
                  E.preventDefault(),dc(Is.ZALO_URL)
                },className:"h-7 px-2.5 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs",children:[a.jsx(od, {
                  className:"w-3 h-3"
                }),a.jsx("span", {
                  children:e("ordersScreen.deliveryNoticeSupport")
                })]
              })]
            })]
          }),ae&&a.jsxs("div", {
            className:"px-4 pb-4 space-y-4 border-t border-border pt-4",children:[a.jsxs("div", {
              className:"space-y-2",children:[a.jsxs("h5", {
                className:"text-xs font-semibold text-text-muted flex items-center gap-1.5",children:[a.jsx(js, {
                  className:"w-3.5 h-3.5 text-primary"
                }),e("ordersScreen.progress")]
              }),a.jsx("div", {
                className:"grid grid-cols-4 gap-2 text-center",children:[ {
                  step:1,titleKey:"ordersScreen.stepOrder",done:!0
                }, {
                  step:2,titleKey:"ordersScreen.stepPayment",done:M.status!==Ct.PENDING
                }, {
                  step:3,titleKey:"ordersScreen.stepDelivery",done:M.status===Ct.COMPLETED||H
                }, {
                  step:4,titleKey:"ordersScreen.stepComplete",done:M.status===Ct.COMPLETED
                }
                ].map((E,F)=>a.jsxs("div", {
                  className:"flex flex-col items-center gap-1",children:[a.jsx("div", {
                    className:et("w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",E.done?"bg-emerald-500 text-white":"bg-surface-2 text-text-muted"),children:E.done?a.jsx(pn, {
                      className:"w-3.5 h-3.5"
                    }):E.step
                  }),a.jsx("span", {
                    className:et("text-[11px]",E.done?"text-emerald-600 dark:text-emerald-400 font-medium":"text-text-muted"),children:e(E.titleKey)
                  })]
                },F))
              })]
            }),a.jsxs("div", {
              className:"grid grid-cols-1 md:grid-cols-2 gap-3 text-xs",children:[a.jsxs("div", {
                className:"p-3 rounded-lg bg-surface space-y-1.5",children:[a.jsxs("h6", {
                  className:"font-semibold text-text flex items-center gap-1.5 text-[11px]",children:[a.jsx(ui, {
                    className:"w-3.5 h-3.5 text-primary"
                  }),e("ordersScreen.buyerInfo")]
                }),a.jsxs("div", {
                  className:"space-y-1 text-text-muted",children:[M.customerName&&a.jsxs("div", {
                    className:"flex items-center gap-1.5",children:[a.jsx("span", {
                      children:e("ordersScreen.fullName")
                    }),a.jsx("span", {
                      className:"text-text font-medium",children:M.customerName
                    })]
                  }),M.customerEmail&&a.jsxs("div", {
                    className:"flex items-center gap-1.5",children:[a.jsx(el, {
                      className:"w-3 h-3"
                    }),a.jsx("span", {
                      className:"text-text font-medium",children:M.customerEmail
                    })]
                  }),M.customerPhone&&a.jsxs("div", {
                    className:"flex items-center gap-1.5",children:[a.jsx(lp, {
                      className:"w-3 h-3"
                    }),a.jsx("span", {
                      className:"text-text font-medium",children:M.customerPhone
                    })]
                  })]
                })]
              }),a.jsxs("div", {
                className:"p-3 rounded-lg bg-surface space-y-1.5",children:[a.jsxs("h6", {
                  className:"font-semibold text-text flex items-center gap-1.5 text-[11px]",children:[a.jsx(vm, {
                    className:"w-3.5 h-3.5 text-primary"
                  }),e("ordersScreen.paymentSummary")]
                }),a.jsxs("div", {
                  className:"space-y-1",children:[a.jsxs("div", {
                    className:"flex justify-between text-text-muted",children:[a.jsx("span", {
                      children:e("ordersScreen.subtotal")
                    }),a.jsx("span", {
                      className:"text-text",children:a.jsx(Fs, {
                        locales:"vi-VN",value:M.totalAmount,format: {
                          style:"currency",currency:"VND",minimumFractionDigits:0
                        }
                        
                      })
                    })]
                  }),Number(M.discountAmount||0)>0&&a.jsxs("div", {
                    className:"flex justify-between text-emerald-600 dark:text-emerald-400",children:[a.jsx("span", {
                      children:e("ordersScreen.discount")
                    }),a.jsxs("span", {
                      children:["-",a.jsx(Fs, {
                        locales:"vi-VN",value:M.discountAmount,format: {
                          style:"currency",currency:"VND",minimumFractionDigits:0
                        }
                        
                      })]
                    })]
                  }),a.jsxs("div", {
                    className:"flex justify-between text-text font-semibold pt-1 border-t border-border",children:[a.jsx("span", {
                      children:e("ordersScreen.finalAmount")
                    }),a.jsxs("span", {
                      className:"font-bold bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent",children:[V.toLocaleString("vi-VN")," ₫"]
                    })]
                  })]
                })]
              })]
            }),a.jsxs("div", {
              className:"flex items-center gap-2 pt-1",children:[a.jsxs("a", {
                href:Is.ZALO_URL,target:"_blank",rel:"noreferrer",onClick:E=> {
                  E.preventDefault(),dc(Is.ZALO_URL)
                },className:"px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-1.5 cursor-pointer",children:[a.jsx(od, {
                  className:"w-3.5 h-3.5"
                }),e("ordersScreen.supportZalo")]
              }),a.jsxs(Ue, {
                type:"button",onClick:()=>t("/store"),className:"px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors flex items-center gap-1.5 cursor-pointer",children:[e("ordersScreen.buyOtherProducts"),a.jsx(Ur, {
                  className:"w-3.5 h-3.5"
                })]
              })]
            })]
          })]
        },M.id)
      })
    }),y&&a.jsx("div", {
      className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm",children:a.jsxs("div", {
        className:"bg-card border border-border rounded-2xl max-w-lg w-full p-5 space-y-4 relative",children:[a.jsxs("div", {
          className:"flex items-start justify-between",children:[a.jsxs("div", {
            className:"space-y-0.5",children:[a.jsxs("div", {
              className:"flex items-center gap-2",children:[a.jsx($2, {
                className:"w-4 h-4 text-primary"
              }),a.jsxs("h3", {
                className:"text-base font-semibold text-text",children:["#",y.orderCode||y.code]
              })]
            }),a.jsx("p", {
              className:"text-xs text-text-muted",children:new Date(y.createdAt).toLocaleString("vi-VN")
            })]
          }),a.jsx("button", {
            type:"button",onClick:()=>S(null),className:"p-1.5 rounded-md text-text-muted hover:text-text transition-colors cursor-pointer",children:a.jsx(Yt, {
              className:"w-4 h-4"
            })
          })]
        }),a.jsxs("div", {
          className:"space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar",children:[a.jsx("h4", {
            className:"text-xs font-semibold text-text-muted",children:e("ordersScreen.productList")
          }),y.items?.map((M,H)=> {
            const ae=Na(M.deliveredData||M.cdKey||M.digitalAccountInfo);
            return a.jsxs("div", {
              className:"p-3 rounded-lg bg-surface space-y-2.5 text-xs",children:[a.jsxs("div", {
                className:"flex justify-between font-medium text-text",children:[a.jsx("span", {
                  children:M.productTitle||M.productName
                }),a.jsx("span", {
                  className:"text-primary font-semibold",children:a.jsx(Fs, {
                    locales:"vi-VN",value:M.price||M.unitPrice||0,format: {
                      style:"currency",currency:"VND",minimumFractionDigits:0
                    }
                    
                  })
                })]
              }),ae.length>0&&a.jsx("div", {
                className:"space-y-1.5",children:ae.map((te,K)=>a.jsxs("div", {
                  className:"p-2.5 rounded-lg bg-primary/10 border border-primary/20 font-mono text-primary text-xs flex items-center justify-between gap-2",children:[a.jsx("span", {
                    className:"break-all font-semibold select-all",children:te
                  }),a.jsx("button", {
                    type:"button",onClick:()=>U(te),className:"p-1.5 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer flex items-center justify-center shrink-0",title:e("ordersScreen.copyKey"),children:f===te?a.jsx(pn, {
                      className:"w-4 h-4 text-emerald-300"
                    }):a.jsx(Bs, {
                      className:"w-4 h-4"
                    })
                  })]
                },K))
              })]
            },H)
          }),a.jsxs("div", {
            className:"p-3 rounded-lg bg-surface space-y-1.5 text-xs",children:[a.jsxs("div", {
              className:"flex justify-between text-text-muted",children:[a.jsx("span", {
                children:e("ordersScreen.paymentMethod")
              }),a.jsx("span", {
                className:"text-text font-medium",children:y.paymentMethod||"N/A"
              })]
            }),a.jsxs("div", {
              className:"flex justify-between text-text-muted",children:[a.jsx("span", {
                children:e("ordersScreen.status")
              }),$(y.status,Jb(y))]
            }),a.jsxs("div", {
              className:"flex justify-between text-text font-semibold pt-1.5 border-t border-border",children:[a.jsx("span", {
                children:e("ordersScreen.totalPayment")
              }),a.jsxs("span", {
                className:"font-bold bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent",children:[Number(y.finalAmount??y.totalAmount??0).toLocaleString("vi-VN")," ₫"]
              })]
            })]
          })]
        }),a.jsx("div", {
          className:"flex justify-end",children:a.jsx(Ue, {
            type:"button",onClick:()=>S(null),className:"px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary-hover transition-colors cursor-pointer",children:e("common.buttons.close")
          })
        })]
      })
    })]
  })
},fee=()=> {
  const {
    t:e
  }
  =Pt();
  return a.jsxs("div", {
    className:"w-full max-w-[1600px] mx-auto py-8 px-4 sm:px-8 lg:px-12",children:[a.jsxs("div", {
      className:"mb-10 text-center",children:[a.jsx("div", {
        className:"w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mx-auto mb-4",children:a.jsx(aa, {
          className:"w-8 h-8"
        })
      }),a.jsx("h1", {
        className:"text-2xl sm:text-3xl font-black text-text tracking-tight mb-2",children:e("policyPages.privacyTitle")
      }),a.jsx("p", {
        className:"text-text-muted font-medium max-w-xl mx-auto",children:"Tại Deluxe Gaming, chúng tôi tôn trọng và cam kết bảo vệ thông tin cá nhân của khách hàng. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo mật dữ liệu để đảm bảo sự an tâm cho bạn."
      })]
    }),a.jsxs("div", {
      className:"space-y-8",children:[a.jsxs("section", {
        className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2", {
          className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span", {
            className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"1"
          }),"Mục đích thu thập thông tin"]
        }),a.jsx("p", {
          className:"text-text-muted mb-4",children:"Chúng tôi thu thập dữ liệu khách hàng nhằm phục vụ cho các mục đích:"
        }),a.jsxs("ul", {
          className:"grid grid-cols-1 md:grid-cols-2 gap-3 text-text-muted",children:[a.jsxs("li", {
            className:"flex items-start gap-3",children:[a.jsx(Sn, {
              className:"w-5 h-5 text-indigo-500 shrink-0 mt-0.5"
            }),a.jsx("span", {
              children:"Xử lý đơn hàng và thanh toán"
            })]
          }),a.jsxs("li", {
            className:"flex items-start gap-3",children:[a.jsx(Sn, {
              className:"w-5 h-5 text-indigo-500 shrink-0 mt-0.5"
            }),a.jsx("span", {
              children:"Gửi key, sản phẩm và thông tin giao dịch"
            })]
          }),a.jsxs("li", {
            className:"flex items-start gap-3",children:[a.jsx(Sn, {
              className:"w-5 h-5 text-indigo-500 shrink-0 mt-0.5"
            }),a.jsx("span", {
              children:"Hỗ trợ kỹ thuật và chăm sóc khách hàng"
            })]
          }),a.jsxs("li", {
            className:"flex items-start gap-3",children:[a.jsx(Sn, {
              className:"w-5 h-5 text-indigo-500 shrink-0 mt-0.5"
            }),a.jsx("span", {
              children:"Cải thiện chất lượng dịch vụ"
            })]
          }),a.jsxs("li", {
            className:"flex items-start gap-3 md:col-span-2",children:[a.jsx(Sn, {
              className:"w-5 h-5 text-indigo-500 shrink-0 mt-0.5"
            }),a.jsx("span", {
              children:"Gửi thông báo khuyến mãi, ưu đãi (nếu được chấp thuận)"
            })]
          })]
        }),a.jsx("div", {
          className:"mt-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-medium",children:"Deluxe Gaming không thu thập dữ liệu không cần thiết và không sử dụng dữ liệu ngoài các mục đích được nêu rõ."
        })]
      }),a.jsxs("section", {
        className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2", {
          className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span", {
            className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"2"
          }),"Thông tin thu thập"]
        }),a.jsxs("div", {
          className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[a.jsxs("div", {
            className:"p-5 rounded-2xl bg-surface border border-border",children:[a.jsxs("h3", {
              className:"font-semibold text-text mb-3 flex items-center gap-2",children:[a.jsx("span", {
                className:"px-2 py-1 rounded-md bg-surface border border-border text-xs font-bold text-primary shadow-sm",children:"2.1"
              }),"Khách hàng"]
            }),a.jsxs("ul", {
              className:"space-y-2 text-sm text-text-muted",children:[a.jsx("li", {
                children:"• Họ tên, Email, Số điện thoại"
              }),a.jsx("li", {
                children:"• Địa chỉ (nếu cần)"
              }),a.jsx("li", {
                children:"• Thông tin tài khoản hệ thống"
              })]
            })]
          }),a.jsxs("div", {
            className:"p-5 rounded-2xl bg-surface border border-border",children:[a.jsxs("h3", {
              className:"font-semibold text-text mb-3 flex items-center gap-2",children:[a.jsx("span", {
                className:"px-2 py-1 rounded-md bg-surface border border-border text-xs font-bold text-primary shadow-sm",children:"2.2"
              }),"Giao dịch"]
            }),a.jsxs("ul", {
              className:"space-y-2 text-sm text-text-muted",children:[a.jsx("li", {
                children:"• Lịch sử mua hàng"
              }),a.jsx("li", {
                children:"• Thời gian & Giá trị đơn hàng"
              }),a.jsx("li", {
                children:"• Phương thức thanh toán"
              })]
            })]
          }),a.jsxs("div", {
            className:"p-5 rounded-2xl bg-surface border border-border",children:[a.jsxs("h3", {
              className:"font-semibold text-text mb-3 flex items-center gap-2",children:[a.jsx("span", {
                className:"px-2 py-1 rounded-md bg-surface border border-border text-xs font-bold text-primary shadow-sm",children:"2.3"
              }),"Kỹ thuật"]
            }),a.jsxs("ul", {
              className:"space-y-2 text-sm text-text-muted",children:[a.jsx("li", {
                children:"• Địa chỉ IP & Trình duyệt"
              }),a.jsx("li", {
                children:"• Thiết bị truy cập"
              }),a.jsx("li", {
                children:"• Cookies cá nhân hóa"
              })]
            })]
          })]
        }),a.jsx("p", {
          className:"mt-4 text-sm text-text-muted italic",children:"Các thông tin này giúp hệ thống hoạt động mượt mà hơn và tối ưu trải nghiệm người dùng."
        })]
      }),a.jsxs("div", {
        className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[a.jsxs("section", {
          className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2", {
            className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span", {
              className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"3"
            }),"Phạm vi sử dụng"]
          }),a.jsxs("ul", {
            className:"space-y-2 text-sm text-text-muted mb-4",children:[a.jsx("li", {
              children:"• Xác nhận và xử lý đơn hàng"
            }),a.jsx("li", {
              children:"• Gửi sản phẩm (Steam Key, dịch vụ)"
            }),a.jsx("li", {
              children:"• Liên hệ khi cần hỗ trợ"
            }),a.jsx("li", {
              children:"• Thông báo ưu đãi (nếu đồng ý)"
            }),a.jsx("li", {
              children:"• Nâng cấp hệ thống & bảo mật"
            })]
          }),a.jsx("div", {
            className:"p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold",children:"Cam kết: KHÔNG BÁN – KHÔNG CHO THUÊ – KHÔNG TRAO ĐỔI dữ liệu với bên thứ ba vì mục đích thương mại."
          })]
        }),a.jsxs("section", {
          className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2", {
            className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span", {
              className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"4"
            }),"Chia sẻ dữ liệu"]
          }),a.jsx("p", {
            className:"text-sm text-text-muted mb-3",children:"Chúng tôi chỉ chia sẻ khi thực sự cần thiết, bao gồm:"
          }),a.jsxs("ul", {
            className:"space-y-2 text-sm text-text-muted mb-4",children:[a.jsxs("li", {
              className:"flex items-center gap-2",children:[a.jsx($9, {
                className:"w-4 h-4"
              })," Đối tác thanh toán"]
            }),a.jsxs("li", {
              className:"flex items-center gap-2",children:[a.jsx(B9, {
                className:"w-4 h-4"
              })," Đơn vị cung cấp máy chủ lưu trữ"]
            }),a.jsxs("li", {
              className:"flex items-center gap-2",children:[a.jsx(js, {
                className:"w-4 h-4"
              })," Cơ quan pháp luật khi có yêu cầu hợp lệ"]
            })]
          }),a.jsx("div", {
            className:"p-3 rounded-lg bg-surface-2 text-text-muted text-xs font-medium",children:"Ngoài ra, thông tin được giữ bí mật tuyệt đối."
          })]
        })]
      }),a.jsxs("div", {
        className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[a.jsxs("section", {
          className:"p-6 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2", {
            className:"text-lg font-bold text-text mb-3 flex items-center gap-3",children:[a.jsx("span", {
              className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"5"
            }),"Bảo vệ dữ liệu"]
          }),a.jsxs("ul", {
            className:"space-y-2 text-sm text-text-muted",children:[a.jsx("li", {
              children:"• Mã hóa dữ liệu truyền tải"
            }),a.jsx("li", {
              children:"• Tường lửa bảo vệ nhiều lớp"
            }),a.jsx("li", {
              children:"• Giới hạn & xác thực quyền"
            }),a.jsx("li", {
              children:"• Quét bảo mật định kỳ"
            })]
          })]
        }),a.jsxs("section", {
          className:"p-6 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2", {
            className:"text-lg font-bold text-text mb-3 flex items-center gap-3",children:[a.jsx("span", {
              className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"6"
            }),"Quyền của bạn"]
          }),a.jsxs("ul", {
            className:"space-y-2 text-sm text-text-muted mb-3",children:[a.jsx("li", {
              children:"• Yêu cầu xem thông tin"
            }),a.jsx("li", {
              children:"• Yêu cầu chỉnh sửa"
            }),a.jsx("li", {
              children:"• Yêu cầu xóa dữ liệu"
            }),a.jsx("li", {
              children:"• Từ chối nhận email quảng cáo"
            })]
          }),a.jsx("p", {
            className:"text-xs text-text-muted italic",children:"Xử lý trong vòng 24–72 giờ."
          })]
        }),a.jsxs("section", {
          className:"p-6 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2", {
            className:"text-lg font-bold text-text mb-3 flex items-center gap-3",children:[a.jsx("span", {
              className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"7"
            }),"Cookies"]
          }),a.jsxs("ul", {
            className:"space-y-2 text-sm text-text-muted mb-3",children:[a.jsx("li", {
              children:"• Ghi nhớ tùy chọn web"
            }),a.jsx("li", {
              children:"• Tối ưu giao diện & tốc độ"
            }),a.jsx("li", {
              children:"• Đo lường hiệu suất (Analytics)"
            })]
          }),a.jsx("p", {
            className:"text-xs text-text-muted italic",children:"Bạn có thể tắt cookies trong trình duyệt."
          })]
        })]
      }),a.jsxs("section", {
        className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm flex flex-col md:flex-row gap-8 items-start",children:[a.jsxs("div", {
          className:"flex-1",children:[a.jsxs("h2", {
            className:"text-lg font-bold text-text mb-3 flex items-center gap-2",children:[a.jsx(vC, {
              className:"w-5 h-5 text-primary"
            }),"8. Lưu trữ thông tin"]
          }),a.jsx("p", {
            className:"text-sm text-text-muted mb-4",children:"Thông tin chỉ được giữ trong thời gian cần thiết để cấp dịch vụ hoặc theo quy định pháp luật. Khi hết hạn, dữ liệu sẽ được xóa/ẩn vĩnh viễn."
          })]
        }),a.jsx("div", {
          className:"w-[1px] h-20 bg-border hidden md:block"
        }),a.jsxs("div", {
          className:"flex-1",children:[a.jsxs("h2", {
            className:"text-lg font-bold text-text mb-3 flex items-center gap-2",children:[a.jsx(wm, {
              className:"w-5 h-5 text-primary"
            }),"9. Liên hệ hỗ trợ"]
          }),a.jsx("p", {
            className:"text-sm text-text-muted mb-4",children:"Bạn có thể tra cứu, chỉnh sửa hoặc yêu cầu xử lý dữ liệu qua Email, Fanpage, hoặc Hotline. Chúng tôi cam kết minh bạch và hợp pháp."
          })]
        })]
      }),a.jsxs("div", {
        className:"mt-8 text-center p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-surface to-background border border-border/50",children:[a.jsx("h2", {
          className:"text-xl font-bold text-text mb-3",children:"Cam kết của Deluxe Gaming"
        }),a.jsx("p", {
          className:"text-text-muted max-w-lg mx-auto mb-6 text-sm",children:"Chúng tôi đặt quyền riêng tư và sự an toàn thông tin của bạn lên hàng đầu."
        }),a.jsxs("div", {
          className:"flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-text",children:[a.jsxs("span", {
            className:"flex items-center gap-2",children:[a.jsx(oi, {
              className:"w-4 h-4 text-indigo-500"
            })," Thu thập minh bạch"]
          }),a.jsxs("span", {
            className:"flex items-center gap-2",children:[a.jsx(Sn, {
              className:"w-4 h-4 text-emerald-500"
            })," Đúng mục đích"]
          }),a.jsxs("span", {
            className:"flex items-center gap-2",children:[a.jsx(aa, {
              className:"w-4 h-4 text-rose-500"
            })," Bảo mật chặt chẽ"]
          }),a.jsxs("span", {
            className:"flex items-center gap-2",children:[a.jsx(DB, {
              className:"w-4 h-4 text-amber-500"
            })," Không chia sẻ tùy tiện"]
          })]
        }),a.jsx("p", {
          className:"mt-6 text-text-muted text-sm italic font-medium",children:"Deluxe Gaming – Uy tín tạo niềm tin cho mọi game thủ Việt."
        })]
      })]
    })]
  })
};
function cT(e,t) {
  (t==null||t>e.length)&&(t=e.length);
  for(var n=0,s=Array(t);
  n<t;
  n++)s[n]=e[n];
  return s
}
function mee(e) {
  if(Array.isArray(e))return e
}
function pee(e,t) {
  var n=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];
  if(n!=null) {
    var s,i,l,c,d=[],f=!0,m=!1;
    try {
      if(l=(n=n.call(e)).next,t!==0)for(;
      !(f=(s=l.call(n)).done)&&(d.push(s.value),d.length!==t);
      f=!0);
      
    }
    catch(p) {
      m=!0,i=p
    }
    finally {
      try {
        if(!f&&n.return!=null&&(c=n.return(),Object(c)!==c))return
      }
      finally {
        if(m)throw i
      }
      
    }
    return d
  }
  
}
function gee() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function xee(e,t) {
  return mee(e)||pee(e,t)||bee(e,t)||gee()
}
function bee(e,t) {
  if(e) {
    if(typeof e=="string")return cT(e,t);
    var n= {
      
    }
    .toString.call(e).slice(8,-1);
    return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?cT(e,t):void 0
  }
  
}
const H3=Object.entries,uT=Object.setPrototypeOf,yee=Object.isFrozen,vee=Object.getPrototypeOf,wee=Object.getOwnPropertyDescriptor;
let ns=Object.freeze,ps=Object.seal,Ql=Object.create,q3=typeof Reflect<"u"&&Reflect,A0=q3.apply,O0=q3.construct;
ns||(ns=function(t) {
  return t
});
ps||(ps=function(t) {
  return t
});
A0||(A0=function(t,n) {
  for(var s=arguments.length,i=new Array(s>2?s-2:0),l=2;
  l<s;
  l++)i[l-2]=arguments[l];
  return t.apply(n,i)
});
O0||(O0=function(t) {
  for(var n=arguments.length,s=new Array(n>1?n-1:0),i=1;
  i<n;
  i++)s[i-1]=arguments[i];
  return new t(...s)
});
const zo=Xn(Array.prototype.forEach),See=Xn(Array.prototype.lastIndexOf),dT=Xn(Array.prototype.pop),Ru=Xn(Array.prototype.push),Nee=Xn(Array.prototype.splice),oc=Array.isArray,Uu=Xn(String.prototype.toLowerCase),ey=Xn(String.prototype.toString),hT=Xn(String.prototype.match),Du=Xn(String.prototype.replace),fT=Xn(String.prototype.indexOf),jee=Xn(String.prototype.trim),kee=Xn(Number.prototype.toString),_ee=Xn(Boolean.prototype.toString),mT=typeof BigInt>"u"?null:Xn(BigInt.prototype.toString),pT=typeof Symbol>"u"?null:Xn(Symbol.prototype.toString),Xs=Xn(Object.prototype.hasOwnProperty),Mu=Xn(Object.prototype.toString),As=Xn(RegExp.prototype.test),Do=Tee(TypeError);
function Xn(e) {
  return function(t) {
    t instanceof RegExp&&(t.lastIndex=0);
    for(var n=arguments.length,s=new Array(n>1?n-1:0),i=1;
    i<n;
    i++)s[i-1]=arguments[i];
    return A0(e,t,s)
  }
  
}
function Tee(e) {
  return function() {
    for(var t=arguments.length,n=new Array(t),s=0;
    s<t;
    s++)n[s]=arguments[s];
    return O0(e,n)
  }
  
}
function It(e,t) {
  let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Uu;
  if(uT&&uT(e,null),!oc(t))return e;
  let s=t.length;
  for(;
  s--;
  ) {
    let i=t[s];
    if(typeof i=="string") {
      const l=n(i);
      l!==i&&(yee(t)||(t[s]=l),i=l)
    }
    e[i]=!0
  }
  return e
}
function Eee(e) {
  for(let t=0;
  t<e.length;
  t++)Xs(e,t)||(e[t]=null);
  return e
}
function pr(e) {
  const t=Ql(null);
  for(const s of H3(e)) {
    var n=xee(s,2);
    const i=n[0],l=n[1];
    Xs(e,i)&&(oc(l)?t[i]=Eee(l):l&&typeof l=="object"&&l.constructor===Object?t[i]=pr(l):t[i]=l)
  }
  return t
}
function Cee(e) {
  switch(typeof e) {
    case"string":return e;
    case"number":return kee(e);
    case"boolean":return _ee(e);
    case"bigint":return mT?mT(e):"0";
    case"symbol":return pT?pT(e):"Symbol()";
    case"undefined":return Mu(e);
    case"function":case"object": {
      if(e===null)return Mu(e);
      const t=e,n=Rr(t,"toString");
      if(typeof n=="function") {
        const s=n(t);
        return typeof s=="string"?s:Mu(s)
      }
      return Mu(e)
    }
    default:return Mu(e)
  }
  
}
function Rr(e,t) {
  for(;
  e!==null;
  ) {
    const s=wee(e,t);
    if(s) {
      if(s.get)return Xn(s.get);
      if(typeof s.value=="function")return Xn(s.value)
    }
    e=vee(e)
  }
  function n() {
    return null
  }
  return n
}
function Aee(e) {
  try {
    return As(e,""),!0
  }
  catch {
    return!1
  }
  
}
const gT=ns(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),ty=ns(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),ny=ns(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),Oee=ns(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),sy=ns(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),Ree=ns(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),xT=ns(["#text"]),bT=ns(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),ry=ns(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dominant-baseline","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","pointer-events","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-orientation","text-rendering","textlength","type","u1","u2","unicode","values","vector-effect","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),yT=ns(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),Tf=ns(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),Dee=ps(/ {
   {
    [\w\W]*|^[\w\W]*
  }
  
}
/g),Mee=ps(/<%[\w\W]*|^[\w\W]*%>/g),Lee=ps(/\$ {
  [\w\W]*/g),Pee=ps(/^data-[\-\w.\u00B7-\uFFFF]+$/),zee=ps(/^aria-[\-\w]+$/),vT=ps(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Fee=ps(/^(?:\w+script|data):/i),Iee=ps(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Bee=ps(/^html$/i),Uee=ps(/^[a-z][.\w]*(-[.\w]+)+$/i),wT=ps(/<[/\w!]/g),ST=ps(/<[/\w]/g),Vee=ps(/<\/no(script|embed|frames)/i),$ee=ps(/\/>/i),hr= {
    element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,processingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12
  },G3=["style","script","xmp","iframe","noembed","noframes","plaintext","noscript"],Hee=ns(It( {
    
  },G3)),qee=(function() {
    const e= {
      
    };
    return zo(G3,t=> {
      e[t]=ps(new RegExp("</"+t+"(?=[\\t\\n\\f\\r />])","i"))
    }),ns(e)
  })(),Gee=function() {
    return typeof window>"u"?null:window
  },Kee=function(t,n) {
    if(typeof t!="object"||typeof t.createPolicy!="function")return null;
    let s=null;
    const i="data-tt-policy-suffix";
    n&&n.hasAttribute(i)&&(s=n.getAttribute(i));
    const l="dompurify"+(s?"#"+s:"");
    try {
      return t.createPolicy(l, {
        createHTML(c) {
          return c
        },createScriptURL(c) {
          return c
        }
        
      })
    }
    catch {
      return console.warn("TrustedTypes policy "+l+" could not be created."),null
    }
    
  },NT=function() {
    return {
      afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]
    }
    
  },Hi=function(t,n,s,i) {
    return Xs(t,n)&&oc(t[n])?It(i.base?pr(i.base): {
      
    },t[n],i.transform):s
  },ay=function(t,n,s) {
    const i=Xs(t,n)?t[n]:void 0;
    return i&&typeof i=="object"?pr(i):s()
  };
  function K3() {
    let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Gee();
    const t=Fe=>K3(Fe);
    if(t.version="3.4.15",t.removed=[],!e||!e.document||e.document.nodeType!==hr.document||!e.Element)return t.isSupported=!1,t;
    let n=e.document;
    const s=n,i=s.currentScript;
    e.DocumentFragment;
    const l=e.HTMLTemplateElement,c=e.Node,d=e.Element,f=e.NodeFilter,m=e.NamedNodeMap;
    m===void 0&&(e.NamedNodeMap||e.MozNamedAttrMap),e.HTMLFormElement;
    const p=e.DOMParser,g=e.trustedTypes,y=d.prototype,S=Rr(y,"cloneNode"),v=Rr(y,"remove"),N=Rr(y,"removeAttributeNode"),j=Rr(y,"nextSibling"),_=Rr(y,"childNodes"),k=Rr(y,"parentNode"),C=Rr(y,"shadowRoot"),A=Rr(y,"attributes"),U=c&&c.prototype?Rr(c.prototype,"nodeType"):null,B=c&&c.prototype?Rr(c.prototype,"nodeName"):null,R=c&&c.prototype?Rr(c.prototype,"ownerDocument"):null,L=function(z) {
      return U?U(z):z.nodeType
    },$=function(z) {
      return B?B(z):z.nodeName
    };
    if(typeof l=="function") {
      const Fe=n.createElement("template");
      Fe.content&&Fe.content.ownerDocument&&(n=Fe.content.ownerDocument)
    }
    let M,H="",ae,te=!1,K=0;
    const V=function() {
      if(K>0)throw Do('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')
    },E=function(z) {
      V(),K++;
      try {
        return M.createHTML(z)
      }
      finally {
        K--
      }
      
    },F=function(z) {
      V(),K++;
      try {
        return M.createScriptURL(z)
      }
      finally {
        K--
      }
      
    },P=function() {
      return te||(ae=Kee(g,i),te=!0),ae
    },Y=n,q=Y.implementation,D=Y.createNodeIterator,X=Y.createDocumentFragment,fe=Y.getElementsByTagName,ue=s.importNode;
    let he=NT();
    t.isSupported=typeof H3=="function"&&typeof k=="function"&&q&&q.createHTMLDocument!==void 0;
    const ve=Dee,be=Mee,Ae=Lee,Te=Pee,Ve=zee,le=Fee,oe=Iee,je=Uee;
    let $e=vT,Ge=null;
    const St=It( {
      
    },[...gT,...ty,...ny,...sy,...xT]);
    let ge=null;
    const Re=It( {
      
    },[...bT,...ry,...yT,...Tf]);
    let G=Object.seal(Ql(null, {
      tagNameCheck: {
        writable:!0,configurable:!1,enumerable:!0,value:null
      },attributeNameCheck: {
        writable:!0,configurable:!1,enumerable:!0,value:null
      },allowCustomizedBuiltInElements: {
        writable:!0,configurable:!1,enumerable:!0,value:!1
      }
      
    })),se=null,Le=null;
    const Ne=Object.seal(Ql(null, {
      tagCheck: {
        writable:!0,configurable:!1,enumerable:!0,value:null
      },attributeCheck: {
        writable:!0,configurable:!1,enumerable:!0,value:null
      }
      
    }));
    let Ke=!0,We=!0,He=!1,ot=!0,Qe=!1,mt=!0,zt=!1,Rt=!1,nt=null,Zt=null,I=!1,Z=!1,Q=!1,xe=!1,ke=!0,Ee=!1;
    const De="user-content-";
    let Pe=!0,qe=!1,Xe= {
      
    },xt=null;
    const Xt=It( {
      
    },["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);
    let qt=null;
    const ut=It( {
      
    },["audio","video","img","source","image","track"]);
    let Gt=null;
    const $t=It( {
      
    },["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Kt="http://www.w3.org/1998/Math/MathML",is="http://www.w3.org/2000/svg",Ft="http://www.w3.org/1999/xhtml";
    let xn=Ft,Rn=!1,_s=null;
    const os=It( {
      
    },[Kt,is,Ft],ey),Vn=ns(["mi","mo","mn","ms","mtext"]);
    let La=It( {
      
    },Vn);
    const rr=ns(["annotation-xml"]);
    let nn=It( {
      
    },rr);
    const ls=It( {
      
    },["title","style","font","a","script"]);
    let Vs=null;
    const re=["application/xhtml+xml","text/html"],Ie="text/html";
    let Je=null,vt=null;
    const Dt=n.createElement("form"),jt=function(z) {
      return z instanceof RegExp||z instanceof Function
    },bn=function() {
      let z=arguments.length>0&&arguments[0]!==void 0?arguments[0]: {
        
      };
      if(vt&&vt===z)return;
      (!z||typeof z!="object")&&(z= {
        
      }),z=pr(z),Vs=re.indexOf(z.PARSER_MEDIA_TYPE)===-1?Ie:z.PARSER_MEDIA_TYPE,Je=Vs==="application/xhtml+xml"?ey:Uu,Ge=Hi(z,"ALLOWED_TAGS",St, {
        transform:Je
      }),ge=Hi(z,"ALLOWED_ATTR",Re, {
        transform:Je
      }),_s=Hi(z,"ALLOWED_NAMESPACES",os, {
        transform:ey
      }),Gt=Hi(z,"ADD_URI_SAFE_ATTR",$t, {
        transform:Je,base:$t
      }),qt=Hi(z,"ADD_DATA_URI_TAGS",ut, {
        transform:Je,base:ut
      }),xt=Hi(z,"FORBID_CONTENTS",Xt, {
        transform:Je
      }),se=Hi(z,"FORBID_TAGS",pr( {
        
      }), {
        transform:Je
      }),Le=Hi(z,"FORBID_ATTR",pr( {
        
      }), {
        transform:Je
      }),Xe=Xs(z,"USE_PROFILES")?z.USE_PROFILES&&typeof z.USE_PROFILES=="object"?pr(z.USE_PROFILES):z.USE_PROFILES:!1,Ke=z.ALLOW_ARIA_ATTR!==!1,We=z.ALLOW_DATA_ATTR!==!1,He=z.ALLOW_UNKNOWN_PROTOCOLS||!1,ot=z.ALLOW_SELF_CLOSE_IN_ATTR!==!1,Qe=z.SAFE_FOR_TEMPLATES||!1,mt=z.SAFE_FOR_XML!==!1,zt=z.WHOLE_DOCUMENT||!1,Z=z.RETURN_DOM||!1,Q=z.RETURN_DOM_FRAGMENT||!1,xe=z.RETURN_TRUSTED_TYPE||!1,I=z.FORCE_BODY||!1,ke=z.SANITIZE_DOM!==!1,Ee=z.SANITIZE_NAMED_PROPS||!1,Pe=z.KEEP_CONTENT!==!1,qe=z.IN_PLACE||!1,$e=Aee(z.ALLOWED_URI_REGEXP)?z.ALLOWED_URI_REGEXP:vT,xn=typeof z.NAMESPACE=="string"?z.NAMESPACE:Ft,La=ay(z,"MATHML_TEXT_INTEGRATION_POINTS",()=>It( {
        
      },Vn)),nn=ay(z,"HTML_INTEGRATION_POINTS",()=>It( {
        
      },rr));
      const ie=ay(z,"CUSTOM_ELEMENT_HANDLING",()=>Ql(null));
      if(G=Ql(null),Xs(ie,"tagNameCheck")&&jt(ie.tagNameCheck)&&(G.tagNameCheck=ie.tagNameCheck),Xs(ie,"attributeNameCheck")&&jt(ie.attributeNameCheck)&&(G.attributeNameCheck=ie.attributeNameCheck),Xs(ie,"allowCustomizedBuiltInElements")&&typeof ie.allowCustomizedBuiltInElements=="boolean"&&(G.allowCustomizedBuiltInElements=ie.allowCustomizedBuiltInElements),ps(G),Qe&&(We=!1),Q&&(Z=!0),Xe&&(Ge=It( {
        
      },xT),ge=Ql(null),Xe.html===!0&&(It(Ge,gT),It(ge,bT)),Xe.svg===!0&&(It(Ge,ty),It(ge,ry),It(ge,Tf)),Xe.svgFilters===!0&&(It(Ge,ny),It(ge,ry),It(ge,Tf)),Xe.mathMl===!0&&(It(Ge,sy),It(ge,yT),It(ge,Tf))),Ne.tagCheck=null,Ne.attributeCheck=null,Xs(z,"ADD_TAGS")&&(typeof z.ADD_TAGS=="function"?Ne.tagCheck=z.ADD_TAGS:oc(z.ADD_TAGS)&&(Ge===St&&(Ge=pr(Ge)),It(Ge,z.ADD_TAGS,Je))),Xs(z,"ADD_ATTR")&&(typeof z.ADD_ATTR=="function"?Ne.attributeCheck=z.ADD_ATTR:oc(z.ADD_ATTR)&&(ge===Re&&(ge=pr(ge)),It(ge,z.ADD_ATTR,Je))),Xs(z,"ADD_FORBID_CONTENTS")&&oc(z.ADD_FORBID_CONTENTS)&&(xt===Xt&&(xt=pr(xt)),It(xt,z.ADD_FORBID_CONTENTS,Je)),Pe&&(Ge["#text"]=!0),zt&&It(Ge,["html","head","body"]),Ge.table&&(It(Ge,["tbody"]),delete se.tbody),z.TRUSTED_TYPES_POLICY) {
        if(typeof z.TRUSTED_TYPES_POLICY.createHTML!="function")throw Do('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if(typeof z.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw Do('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        const Ce=M;
        M=z.TRUSTED_TYPES_POLICY;
        try {
          H=E("")
        }
        catch(Ye) {
          throw M=Ce,Ye
        }
        
      }
      else z.TRUSTED_TYPES_POLICY===null?(M=void 0,H=""):(M===void 0&&(M=P()),M&&typeof H=="string"&&(H=E("")));
      ns&&ns(z),vt=z
    },En=It( {
      
    },[...ty,...ny,...Oee]),ua=It( {
      
    },[...sy,...Ree]),gi=function(z,ie,Ce) {
      return ie.namespaceURI===Ft?z==="svg":ie.namespaceURI===Kt?z==="svg"&&(Ce==="annotation-xml"||La[Ce]):!!En[z]
    },$n=function(z,ie,Ce) {
      return ie.namespaceURI===Ft?z==="math":ie.namespaceURI===is?z==="math"&&nn[Ce]:!!ua[z]
    },zd=function(z,ie,Ce) {
      return ie.namespaceURI===is&&!nn[Ce]||ie.namespaceURI===Kt&&!La[Ce]?!1:!ua[z]&&(ls[z]||!En[z])
    },Fd=function(z) {
      let ie=k(z);
      (!ie||!ie.tagName)&&(ie= {
        namespaceURI:xn,tagName:"template"
      });
      const Ce=Uu(z.tagName),Ye=Uu(ie.tagName);
      return _s[z.namespaceURI]?z.namespaceURI===is?gi(Ce,ie,Ye):z.namespaceURI===Kt?$n(Ce,ie,Ye):z.namespaceURI===Ft?zd(Ce,ie,Ye):!!(Vs==="application/xhtml+xml"&&_s[z.namespaceURI]):!1
    },Ts=function(z) {
      Ru(t.removed, {
        element:z
      });
      try {
        k(z).removeChild(z)
      }
      catch {
        if(v(z),!k(z))throw Do("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")
      }
      
    },Pa=function(z,ie,Ce) {
      try {
        N(z,ie)
      }
      catch {
        try {
          z.removeAttribute(Ce)
        }
        catch {
          
        }
        
      }
      
    },ol=function(z) {
      ll(z);
      const ie=_(z);
      if(ie) {
        const Ye=[];
        zo(ie,at=> {
          Ru(Ye,at)
        }),zo(Ye,at=> {
          try {
            v(at)
          }
          catch {
            
          }
          
        })
      }
      const Ce=A(z);
      if(Ce)for(let Ye=Ce.length-1;
      Ye>=0;
      --Ye) {
        const at=Ce[Ye],ft=at&&at.name;
        typeof ft=="string"&&Pa(z,at,ft)
      }
      
    },da=function(z,ie,Ce) {
      if(!Ce)try {
        Ce=ie.getAttributeNode(z)
      }
      catch {
        Ce=null
      }
      Ru(t.removed, {
        attribute:Ce||null,from:ie
      });
      try {
        Ce?N(ie,Ce):ie.removeAttribute(z)
      }
      catch {
        try {
          ie.removeAttribute(z)
        }
        catch {
          
        }
        
      }
      if(z==="is")if(Z||Q)try {
        Ts(ie)
      }
      catch {
        
      }
      else try {
        ie.setAttribute(z,"")
      }
      catch {
        
      }
      
    },Id=function(z) {
      const ie=A(z);
      if(ie)for(let Ce=ie.length-1;
      Ce>=0;
      --Ce) {
        const Ye=ie[Ce],at=Ye&&Ye.name;
        typeof at!="string"||ge[Je(at)]||Pa(z,Ye,at)
      }
      
    },ll=function(z) {
      const ie=[z];
      for(;
      ie.length>0;
      ) {
        const Ce=ie.pop();
        L(Ce)===hr.element&&Id(Ce);
        const at=_(Ce);
        if(at)for(let ft=at.length-1;
        ft>=0;
        --ft)ie.push(at[ft])
      }
      
    },co=function(z,ie) {
      return mt?z==="patchsrc"?!0:z==="for"&&ie!=="label"&&ie!=="output":!1
    },cl=function(z) {
      if(!mt)return;
      const ie=[z];
      for(;
      ie.length>0;
      ) {
        const Ce=ie.pop(),Ye=L(Ce);
        if(Ye===hr.processingInstruction||Ye===hr.comment&&As(ST,Ce.data)) {
          try {
            v(Ce)
          }
          catch {
            
          }
          continue
        }
        if(Ye===hr.element) {
          const ft=Ce,Wt=Je($(Ce));
          try {
            ft.hasAttribute&&ft.hasAttribute("patchsrc")&&ft.removeAttribute("patchsrc"),ft.hasAttribute&&ft.hasAttribute("for")&&co("for",Wt)&&ft.removeAttribute("for")
          }
          catch {
            
          }
          
        }
        const at=_(Ce);
        if(at)for(let ft=at.length-1;
        ft>=0;
        --ft)ie.push(at[ft])
      }
      
    },Sr=function(z) {
      let ie=null,Ce=null;
      if(I)z="<remove></remove>"+z;
      else {
        const ft=hT(z,/^[\r\n\t ]+/);
        Ce=ft&&ft[0]
      }
      Vs==="application/xhtml+xml"&&xn===Ft&&(z='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+z+"</body></html>");
      const Ye=M?E(z):z;
      if(xn===Ft)try {
        ie=new p().parseFromString(Ye,Vs)
      }
      catch {
        
      }
      if(!ie||!ie.documentElement) {
        ie=q.createDocument(xn,"template",null);
        try {
          ie.documentElement.innerHTML=Rn?H:Ye
        }
        catch {
          
        }
        
      }
      const at=ie.body||ie.documentElement;
      return z&&Ce&&at.insertBefore(n.createTextNode(Ce),at.childNodes[0]||null),xn===Ft?fe.call(ie,zt?"html":"body")[0]:zt?ie.documentElement:at
    },Ms=function(z) {
      const ie=R?R(z):z.ownerDocument;
      return D.call(ie||z,z,f.SHOW_ELEMENT|f.SHOW_COMMENT|f.SHOW_TEXT|f.SHOW_PROCESSING_INSTRUCTION|f.SHOW_CDATA_SECTION,null)
    },uo=function(z) {
      return z=Du(z,ve," "),z=Du(z,be," "),z=Du(z,Ae," "),z
    },Tc=function(z) {
      var ie;
      z.normalize();
      const Ce=R?R(z):z.ownerDocument,Ye=D.call(Ce||z,z,f.SHOW_TEXT|f.SHOW_COMMENT|f.SHOW_CDATA_SECTION|f.SHOW_PROCESSING_INSTRUCTION,null);
      let at=Ye.nextNode();
      for(;
      at;
      )at.data=uo(at.data),at=Ye.nextNode();
      const ft=(ie=z.querySelectorAll)===null||ie===void 0?void 0:ie.call(z,"template");
      ft&&zo(ft,Wt=> {
        za(Wt.content)&&Tc(Wt.content)
      })
    },xi=function(z) {
      const ie=B?B(z):null;
      return typeof ie!="string"||Je(ie)!=="form"?!1:typeof z.nodeName!="string"||typeof z.textContent!="string"||typeof z.removeChild!="function"||z.attributes!==A(z)||typeof z.removeAttribute!="function"||typeof z.removeAttributeNode!="function"||typeof z.getAttributeNode!="function"||typeof z.setAttribute!="function"||typeof z.namespaceURI!="string"||typeof z.insertBefore!="function"||typeof z.hasChildNodes!="function"||z.nodeType!==U(z)||z.childNodes!==_(z)
    },za=function(z) {
      if(!U||typeof z!="object"||z===null)return!1;
      try {
        return U(z)===hr.documentFragment
      }
      catch {
        return!1
      }
      
    },ha=function(z) {
      if(!U||typeof z!="object"||z===null)return!1;
      try {
        return typeof U(z)=="number"
      }
      catch {
        return!1
      }
      
    };
    function Nr(Fe,z,ie) {
      Fe.length!==0&&zo(Fe,Ce=> {
        Ce.call(t,z,ie,vt)
      })
    }
    const $s=function(z,ie) {
      return!!(mt&&z.hasChildNodes()&&!ha(z.firstElementChild)&&As(wT,z.textContent)&&As(wT,z.innerHTML)||mt&&z.namespaceURI===Ft&&Hee[ie]&&(ha(z.firstElementChild)||typeof z.textContent=="string"&&As(qee[ie],z.textContent))||z.nodeType===hr.processingInstruction||mt&&z.nodeType===hr.comment&&As(ST,z.data))
    },bi=function(z,ie) {
      if(z instanceof RegExp)return As(z,ie);
      if(z instanceof Function) {
        for(var Ce=arguments.length,Ye=new Array(Ce>2?Ce-2:0),at=2;
        at<Ce;
        at++)Ye[at-2]=arguments[at];
        return!!z(ie,...Ye)
      }
      return!1
    },Bd=function(z,ie,Ce) {
      if(!se[ie]&&Ud(ie)&&bi(G.tagNameCheck,ie))return!1;
      if(Pe&&!xt[ie]) {
        const Ye=k(z),at=_(z);
        if(at&&Ye) {
          const ft=at.length;
          for(let Wt=ft-1;
          Wt>=0;
          --Wt) {
            const mn=z===Ce?S(at[Wt],!0):at[Wt];
            Ye.insertBefore(mn,j(z))
          }
          
        }
        
      }
      return Ts(z),!0
    },ul=function(z,ie,Ce,Ye) {
      return z.length===0?ie:ie===Ce||ie===Ye?pr(ie):ie
    },Fa=function(z,ie) {
      return z===ie||k(z)!==null?!1:(qe&&ll(z),!0)
    },Ec=function(z,ie) {
      if(Nr(he.beforeSanitizeElements,z,null),Fa(z,ie))return!0;
      if(xi(z))return Ts(z),!0;
      const Ce=Je($(z));
      if(Ge=ul(he.uponSanitizeElement,Ge,St,nt),Nr(he.uponSanitizeElement,z, {
        tagName:Ce,allowedTags:Ge
      }),Fa(z,ie))return!0;
      if($s(z,Ce))return Ts(z),!0;
      if(se[Ce]||!(Ne.tagCheck instanceof Function&&Ne.tagCheck(Ce))&&!Ge[Ce]) {
        const at=Bd(z,Ce,ie);
        return at===!1&&Nr(he.afterSanitizeElements,z,null),at
      }
      if(L(z)===hr.element&&!Fd(z)||(Ce==="noscript"||Ce==="noembed"||Ce==="noframes")&&As(Vee,z.innerHTML))return Ts(z),!0;
      if(Qe&&z.nodeType===hr.text) {
        const at=uo(z.textContent);
        z.textContent!==at&&(Ru(t.removed, {
          element:z.cloneNode()
        }),z.textContent=at)
      }
      return Nr(he.afterSanitizeElements,z,null),!1
    },Cc=function(z,ie,Ce) {
      if(Le[ie]||co(ie,z)||ke&&(ie==="id"||ie==="name")&&(Ce in n||Ce in Dt))return!1;
      const Ye=ge[ie]||Ne.attributeCheck instanceof Function&&Ne.attributeCheck(ie,z);
      return We&&As(Te,ie)||Ke&&As(Ve,ie)?!0:Ye?Gt[ie]||As($e,Du(Ce,oe,""))||(ie==="src"||ie==="xlink:href"||ie==="href")&&z!=="script"&&fT(Ce,"data:")===0&&qt[z]||He&&!As(le,Du(Ce,oe,""))?!0:!Ce:Ud(z)&&bi(G.tagNameCheck,z)&&bi(G.attributeNameCheck,ie,z)||ie==="is"&&G.allowCustomizedBuiltInElements&&bi(G.tagNameCheck,Ce)
    },yi=It( {
      
    },["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Ud=function(z) {
      return!yi[Uu(z)]&&As(je,z)
    },Vd=function(z,ie,Ce,Ye) {
      if(M&&typeof g=="object"&&typeof g.getAttributeType=="function"&&!Ce)switch(g.getAttributeType(z,ie)) {
        case"TrustedHTML":return E(Ye);
        case"TrustedScriptURL":return F(Ye)
      }
      return Ye
    },$d=function(z,ie,Ce,Ye) {
      try {
        return Ce?z.setAttributeNS(Ce,ie,Ye):z.setAttribute(ie,Ye),xi(z)?(Ts(z),!1):!0
      }
      catch {
        return da(ie,z),!1
      }
      
    },dl=function(z) {
      Nr(he.beforeSanitizeAttributes,z,null);
      const ie=z.attributes;
      if(!ie||xi(z))return;
      ge=ul(he.uponSanitizeAttribute,ge,Re,Zt);
      const Ce= {
        attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:ge,forceKeepAttr:void 0
      };
      let Ye=ie.length;
      const at=Je(z.nodeName);
      for(;
      Ye--;
      ) {
        const ft=ie[Ye],Wt=ft.name,mn=ft.namespaceURI,Hn=ft.value,Nn=Je(Wt),ho=Hn;
        let zn=Wt==="value"?ho:jee(ho),qr=!1;
        if(Ce.attrName=Nn,Ce.attrValue=zn,Ce.keepAttr=!0,Ce.forceKeepAttr=void 0,Nr(he.uponSanitizeAttribute,z,Ce),zn=Ce.attrValue,Ee&&(Nn==="id"||Nn==="name")&&fT(zn,De)!==0&&(da(Wt,z,ft),zn=De+zn,qr=!0),mt&&As(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,zn)) {
          da(Wt,z,ft);
          continue
        }
        if(Nn==="attributename"&&hT(zn,"href")) {
          da(Wt,z,ft);
          continue
        }
        if(!Ce.forceKeepAttr) {
          if(!Ce.keepAttr) {
            da(Wt,z,ft);
            continue
          }
          if(!ot&&As($ee,zn)) {
            da(Wt,z,ft);
            continue
          }
          if(Qe&&(zn=uo(zn)),!Cc(at,Nn,zn)) {
            da(Wt,z,ft);
            continue
          }
          zn=Vd(at,Nn,mn,zn),zn!==ho&&$d(z,Wt,mn,zn)&&qr&&dT(t.removed)
        }
        
      }
      Nr(he.afterSanitizeAttributes,z,null)
    },hl=function(z) {
      let ie=null;
      const Ce=Ms(z);
      for(Nr(he.beforeSanitizeShadowDOM,z,null);
      ie=Ce.nextNode();
      )if(Nr(he.uponSanitizeShadowNode,ie,null),Ec(ie,z),dl(ie),za(ie.content)&&hl(ie.content),L(ie)===hr.element) {
        const Ye=C(ie);
        za(Ye)&&(Ac(Ye),hl(Ye))
      }
      Nr(he.afterSanitizeShadowDOM,z,null)
    },Ac=function(z) {
      const ie=[ {
        node:z,shadow:null
      }
      ];
      for(;
      ie.length>0;
      ) {
        const Ce=ie.pop();
        if(Ce.shadow) {
          hl(Ce.shadow);
          continue
        }
        const Ye=Ce.node,ft=L(Ye)===hr.element,Wt=_(Ye);
        if(Wt)for(let mn=Wt.length-1;
        mn>=0;
        --mn)ie.push( {
          node:Wt[mn],shadow:null
        });
        if(ft) {
          const mn=B?B(Ye):null;
          if(typeof mn=="string"&&Je(mn)==="template") {
            const Hn=Ye.content;
            za(Hn)&&ie.push( {
              node:Hn,shadow:null
            })
          }
          
        }
        if(ft) {
          const mn=C(Ye);
          za(mn)&&ie.push( {
            node:null,shadow:mn
          }, {
            node:mn,shadow:null
          })
        }
        
      }
      
    };
    return t.sanitize=function(Fe) {
      let z=arguments.length>1&&arguments[1]!==void 0?arguments[1]: {
        
      },ie=null,Ce=null,Ye=null,at=null;
      if(Rn=!Fe,Rn&&(Fe="<!-->"),typeof Fe!="string"&&!ha(Fe)&&(Fe=Cee(Fe),typeof Fe!="string"))throw Do("dirty is not a string, aborting");
      if(!t.isSupported)return Fe;
      Rt?(Ge=nt,ge=Zt):bn(z),(he.uponSanitizeElement.length>0||he.uponSanitizeAttribute.length>0)&&(Ge=pr(Ge)),he.uponSanitizeAttribute.length>0&&(ge=pr(ge)),t.removed=[];
      const ft=qe&&typeof Fe!="string"&&ha(Fe);
      if(ft) {
        cl(Fe);
        const Hn=$(Fe);
        if(typeof Hn=="string") {
          const Nn=Je(Hn);
          if(!Ge[Nn]||se[Nn])throw ol(Fe),Do("root node is forbidden and cannot be sanitized in-place")
        }
        if(xi(Fe))throw ol(Fe),Do("root node is clobbered and cannot be sanitized in-place");
        try {
          Ac(Fe)
        }
        catch(Nn) {
          throw ol(Fe),Nn
        }
        
      }
      else if(ha(Fe))ie=Sr("<!---->"),Ce=ie.ownerDocument.importNode(Fe,!0),Ce.nodeType===hr.element&&Ce.nodeName==="BODY"||Ce.nodeName==="HTML"?ie=Ce:ie.appendChild(Ce),Ac(ie);
      else {
        if(!Z&&!Qe&&!zt&&Fe.indexOf("<")===-1)return M&&xe?E(Fe):Fe;
        if(ie=Sr(Fe),!ie)return Z?null:xe?H:""
      }
      ie&&I&&Ts(ie.firstChild);
      const Wt=ft?Fe:ie;
      try {
        const Hn=Ms(Wt);
        for(;
        Ye=Hn.nextNode();
        )Ec(Ye,Wt),dl(Ye),za(Ye.content)&&hl(Ye.content)
      }
      catch(Hn) {
        throw ft&&(ol(Fe),zo(t.removed,Nn=> {
          Nn.element&&ll(Nn.element)
        })),Hn
      }
      if(ft)return zo(t.removed,Hn=> {
        Hn.element&&ll(Hn.element)
      }),Qe&&Tc(Fe),Fe;
      if(Z) {
        if(Qe&&Tc(ie),Q)for(at=X.call(ie.ownerDocument);
        ie.firstChild;
        )at.appendChild(ie.firstChild);
        else at=ie;
        return(ge.shadowroot||ge.shadowrootmode)&&(at=ue.call(s,at,!0)),at
      }
      let mn=zt?ie.outerHTML:ie.innerHTML;
      return zt&&Ge["!doctype"]&&ie.ownerDocument&&ie.ownerDocument.doctype&&ie.ownerDocument.doctype.name&&As(Bee,ie.ownerDocument.doctype.name)&&(mn="<!DOCTYPE "+ie.ownerDocument.doctype.name+`>
`+mn),Qe&&(mn=uo(mn)),M&&xe?E(mn):mn
    },t.setConfig=function() {
      let Fe=arguments.length>0&&arguments[0]!==void 0?arguments[0]: {
        
      };
      bn(Fe),Rt=!0,nt=Ge,Zt=ge
    },t.clearConfig=function() {
      vt=null,Rt=!1,nt=null,Zt=null,M=ae,H=""
    },t.isValidAttribute=function(Fe,z,ie) {
      vt||bn( {
        
      });
      const Ce=Je(Fe),Ye=Je(z);
      return Cc(Ce,Ye,ie)
    },t.addHook=function(Fe,z) {
      typeof z=="function"&&Xs(he,Fe)&&Ru(he[Fe],z)
    },t.removeHook=function(Fe,z) {
      if(Xs(he,Fe)) {
        if(z!==void 0) {
          const ie=See(he[Fe],z);
          return ie===-1?void 0:Nee(he[Fe],ie,1)[0]
        }
        return dT(he[Fe])
      }
      
    },t.removeHooks=function(Fe) {
      Xs(he,Fe)&&(he[Fe]=[])
    },t.removeAllHooks=function() {
      he=NT()
    },t
  }
  var jT=K3();
  const Wee= {
    active:!0,breakpoints: {
      
    },delay:4e3,jump:!1,playOnInit:!0,stopOnFocusIn:!0,stopOnInteraction:!0,stopOnMouseEnter:!1,stopOnLastSnap:!1,rootNode:null
  };
  function Yee(e,t) {
    const n=e.scrollSnapList();
    return typeof t=="number"?n.map(()=>t):t(n,e)
  }
  function Zee(e,t) {
    const n=e.rootNode();
    return t&&t(n)||n
  }
  function Nw(e= {
    
  }) {
    let t,n,s,i,l=null,c=0,d=!1,f=!1,m=!1,p=!1;
    function g(K,V) {
      n=K;
      const {
        mergeOptions:E,optionsAtMedia:F
      }
      =V,P=E(Wee,Nw.globalOptions),Y=E(P,e);
      if(t=F(Y),n.scrollSnapList().length<=1)return;
      p=t.jump,s=!1,i=Yee(n,t.delay);
      const {
        eventStore:q,ownerDocument:D
      }
      =n.internalEngine(),X=!!n.internalEngine().options.watchDrag,fe=Zee(n,t.rootNode);
      q.add(D,"visibilitychange",_),X&&n.on("pointerDown",C),X&&!t.stopOnInteraction&&n.on("pointerUp",A),t.stopOnMouseEnter&&q.add(fe,"mouseenter",U),t.stopOnMouseEnter&&!t.stopOnInteraction&&q.add(fe,"mouseleave",B),t.stopOnFocusIn&&n.on("slideFocusStart",j),t.stopOnFocusIn&&!t.stopOnInteraction&&q.add(n.containerNode(),"focusout",N),t.playOnInit&&N()
    }
    function y() {
      n.off("pointerDown",C).off("pointerUp",A).off("slideFocusStart",j),j(),s=!0,d=!1
    }
    function S() {
      const {
        ownerWindow:K
      }
      =n.internalEngine();
      K.clearTimeout(c),c=K.setTimeout(H,i[n.selectedScrollSnap()]),l=new Date().getTime(),n.emit("autoplay:timerset")
    }
    function v() {
      const {
        ownerWindow:K
      }
      =n.internalEngine();
      K.clearTimeout(c),c=0,l=null,n.emit("autoplay:timerstopped")
    }
    function N() {
      if(!s) {
        if(k()) {
          m=!0;
          return
        }
        d||n.emit("autoplay:play"),S(),d=!0
      }
      
    }
    function j() {
      s||(d&&n.emit("autoplay:stop"),v(),d=!1)
    }
    function _() {
      if(k())return m=d,j();
      m&&N()
    }
    function k() {
      const {
        ownerDocument:K
      }
      =n.internalEngine();
      return K.visibilityState==="hidden"
    }
    function C() {
      f||j()
    }
    function A() {
      f||N()
    }
    function U() {
      f=!0,j()
    }
    function B() {
      f=!1,N()
    }
    function R(K) {
      typeof K<"u"&&(p=K),N()
    }
    function L() {
      d&&j()
    }
    function $() {
      d&&N()
    }
    function M() {
      return d
    }
    function H() {
      const {
        index:K
      }
      =n.internalEngine(),V=K.clone().add(1).get(),E=n.scrollSnapList().length-1,F=t.stopOnLastSnap&&V===E;
      if(n.canScrollNext()?n.scrollNext(p):n.scrollTo(0,p),n.emit("autoplay:select"),F)return j();
      N()
    }
    function ae() {
      if(!l)return null;
      const K=i[n.selectedScrollSnap()],V=new Date().getTime()-l;
      return K-V
    }
    return {
      name:"autoplay",options:e,init:g,destroy:y,play:R,stop:L,reset:$,isPlaying:M,timeUntilNext:ae
    }
    
  }
  Nw.globalOptions=void 0;
  function Xee(e) {
    return Object.prototype.toString.call(e)==="[object Object]"
  }
  function kT(e) {
    return Xee(e)||Array.isArray(e)
  }
  function Qee() {
    return!!(typeof window<"u"&&window.document&&window.document.createElement)
  }
  function jw(e,t) {
    const n=Object.keys(e),s=Object.keys(t);
    if(n.length!==s.length)return!1;
    const i=JSON.stringify(Object.keys(e.breakpoints|| {
      
    })),l=JSON.stringify(Object.keys(t.breakpoints|| {
      
    }));
    return i!==l?!1:n.every(c=> {
      const d=e[c],f=t[c];
      return typeof d=="function"?`${d}`==`${f}`:!kT(d)||!kT(f)?d===f:jw(d,f)
    })
  }
  function _T(e) {
    return e.concat().sort((t,n)=>t.name>n.name?1:-1).map(t=>t.options)
  }
  function Jee(e,t) {
    if(e.length!==t.length)return!1;
    const n=_T(e),s=_T(t);
    return n.every((i,l)=> {
      const c=s[l];
      return jw(i,c)
    })
  }
  function kw(e) {
    return typeof e=="number"
  }
  function R0(e) {
    return typeof e=="string"
  }
  function jp(e) {
    return typeof e=="boolean"
  }
  function TT(e) {
    return Object.prototype.toString.call(e)==="[object Object]"
  }
  function Cn(e) {
    return Math.abs(e)
  }
  function _w(e) {
    return Math.sign(e)
  }
  function ed(e,t) {
    return Cn(e-t)
  }
  function ete(e,t) {
    if(e===0||t===0||Cn(e)<=Cn(t))return 0;
    const n=ed(Cn(e),Cn(t));
    return Cn(n/e)
  }
  function tte(e) {
    return Math.round(e*100)/100
  }
  function wd(e) {
    return Sd(e).map(Number)
  }
  function oa(e) {
    return e[Pd(e)]
  }
  function Pd(e) {
    return Math.max(0,e.length-1)
  }
  function Tw(e,t) {
    return t===Pd(e)
  }
  function ET(e,t=0) {
    return Array.from(Array(e),(n,s)=>t+s)
  }
  function Sd(e) {
    return Object.keys(e)
  }
  function W3(e,t) {
    return[e,t].reduce((n,s)=>(Sd(s).forEach(i=> {
      const l=n[i],c=s[i],d=TT(l)&&TT(c);
      n[i]=d?W3(l,c):c
    }),n), {
      
    })
  }
  function D0(e,t) {
    return typeof t.MouseEvent<"u"&&e instanceof t.MouseEvent
  }
  function nte(e,t) {
    const n= {
      start:s,center:i,end:l
    };
    function s() {
      return 0
    }
    function i(f) {
      return l(f)/2
    }
    function l(f) {
      return t-f
    }
    function c(f,m) {
      return R0(e)?n[e](f):e(t,f,m)
    }
    return {
      measure:c
    }
    
  }
  function Nd() {
    let e=[];
    function t(i,l,c,d= {
      passive:!0
    }) {
      let f;
      if("addEventListener"in i)i.addEventListener(l,c,d),f=()=>i.removeEventListener(l,c,d);
      else {
        const m=i;
        m.addListener(c),f=()=>m.removeListener(c)
      }
      return e.push(f),s
    }
    function n() {
      e=e.filter(i=>i())
    }
    const s= {
      add:t,clear:n
    };
    return s
  }
  function ste(e,t,n,s) {
    const i=Nd(),l=1e3/60;
    let c=null,d=0,f=0;
    function m() {
      i.add(e,"visibilitychange",()=> {
        e.hidden&&v()
      })
    }
    function p() {
      S(),i.clear()
    }
    function g(j) {
      if(!f)return;
      c||(c=j,n(),n());
      const _=j-c;
      for(c=j,d+=_;
      d>=l;
      )n(),d-=l;
      const k=d/l;
      s(k),f&&(f=t.requestAnimationFrame(g))
    }
    function y() {
      f||(f=t.requestAnimationFrame(g))
    }
    function S() {
      t.cancelAnimationFrame(f),c=null,d=0,f=0
    }
    function v() {
      c=null,d=0
    }
    return {
      init:m,destroy:p,start:y,stop:S,update:n,render:s
    }
    
  }
  function rte(e,t) {
    const n=t==="rtl",s=e==="y",i=s?"y":"x",l=s?"x":"y",c=!s&&n?-1:1,d=p(),f=g();
    function m(v) {
      const {
        height:N,width:j
      }
      =v;
      return s?N:j
    }
    function p() {
      return s?"top":n?"right":"left"
    }
    function g() {
      return s?"bottom":n?"left":"right"
    }
    function y(v) {
      return v*c
    }
    return {
      scroll:i,cross:l,startEdge:d,endEdge:f,measureSize:m,direction:y
    }
    
  }
  function rl(e=0,t=0) {
    const n=Cn(e-t);
    function s(m) {
      return m<e
    }
    function i(m) {
      return m>t
    }
    function l(m) {
      return s(m)||i(m)
    }
    function c(m) {
      return l(m)?s(m)?e:t:m
    }
    function d(m) {
      return n?m-n*Math.ceil((m-t)/n):m
    }
    return {
      length:n,max:t,min:e,constrain:c,reachedAny:l,reachedMax:i,reachedMin:s,removeOffset:d
    }
    
  }
  function Y3(e,t,n) {
    const {
      constrain:s
    }
    =rl(0,e),i=e+1;
    let l=c(t);
    function c(y) {
      return n?Cn((i+y)%i):s(y)
    }
    function d() {
      return l
    }
    function f(y) {
      return l=c(y),g
    }
    function m(y) {
      return p().set(d()+y)
    }
    function p() {
      return Y3(e,d(),n)
    }
    const g= {
      get:d,set:f,add:m,clone:p
    };
    return g
  }
  function ate(e,t,n,s,i,l,c,d,f,m,p,g,y,S,v,N,j,_,k) {
    const {
      cross:C,direction:A
    }
    =e,U=["INPUT","SELECT","TEXTAREA"],B= {
      passive:!1
    },R=Nd(),L=Nd(),$=rl(50,225).constrain(S.measure(20)),M= {
      mouse:300,touch:400
    },H= {
      mouse:500,touch:600
    },ae=v?43:25;
    let te=!1,K=0,V=0,E=!1,F=!1,P=!1,Y=!1;
    function q(oe) {
      if(!k)return;
      function je(Ge) {
        (jp(k)||k(oe,Ge))&&ve(Ge)
      }
      const $e=t;
      R.add($e,"dragstart",Ge=>Ge.preventDefault(),B).add($e,"touchmove",()=> {
        
      },B).add($e,"touchend",()=> {
        
      }).add($e,"touchstart",je).add($e,"mousedown",je).add($e,"touchcancel",Ae).add($e,"contextmenu",Ae).add($e,"click",Te,!0)
    }
    function D() {
      R.clear(),L.clear()
    }
    function X() {
      const oe=Y?n:t;
      L.add(oe,"touchmove",be,B).add(oe,"touchend",Ae).add(oe,"mousemove",be,B).add(oe,"mouseup",Ae)
    }
    function fe(oe) {
      const je=oe.nodeName||"";
      return U.includes(je)
    }
    function ue() {
      return(v?H:M)[Y?"mouse":"touch"]
    }
    function he(oe,je) {
      const $e=g.add(_w(oe)*-1),Ge=p.byDistance(oe,!v).distance;
      return v||Cn(oe)<$?Ge:j&&je?Ge*.5:p.byIndex($e.get(),0).distance
    }
    function ve(oe) {
      const je=D0(oe,s);
      Y=je,P=v&&je&&!oe.buttons&&te,te=ed(i.get(),c.get())>=2,!(je&&oe.button!==0)&&(fe(oe.target)||(E=!0,l.pointerDown(oe),m.useFriction(0).useDuration(0),i.set(c),X(),K=l.readPoint(oe),V=l.readPoint(oe,C),y.emit("pointerDown")))
    }
    function be(oe) {
      if(!D0(oe,s)&&oe.touches.length>=2)return Ae(oe);
      const $e=l.readPoint(oe),Ge=l.readPoint(oe,C),St=ed($e,K),ge=ed(Ge,V);
      if(!F&&!Y&&(!oe.cancelable||(F=St>ge,!F)))return Ae(oe);
      const Re=l.pointerMove(oe);
      St>N&&(P=!0),m.useFriction(.3).useDuration(.75),d.start(),i.add(A(Re)),oe.preventDefault()
    }
    function Ae(oe) {
      const $e=p.byDistance(0,!1).index!==g.get(),Ge=l.pointerUp(oe)*ue(),St=he(A(Ge),$e),ge=ete(Ge,St),Re=ae-10*ge,G=_+ge/50;
      F=!1,E=!1,L.clear(),m.useDuration(Re).useFriction(G),f.distance(St,!v),Y=!1,y.emit("pointerUp")
    }
    function Te(oe) {
      P&&(oe.stopPropagation(),oe.preventDefault(),P=!1)
    }
    function Ve() {
      return E
    }
    return {
      init:q,destroy:D,pointerDown:Ve
    }
    
  }
  function ite(e,t) {
    let s,i;
    function l(g) {
      return g.timeStamp
    }
    function c(g,y) {
      const v=`client${(y||e.scroll)==="x"?"X":"Y"}`;
      return(D0(g,t)?g:g.touches[0])[v]
    }
    function d(g) {
      return s=g,i=g,c(g)
    }
    function f(g) {
      const y=c(g)-c(i),S=l(g)-l(s)>170;
      return i=g,S&&(s=g),y
    }
    function m(g) {
      if(!s||!i)return 0;
      const y=c(i)-c(s),S=l(g)-l(s),v=l(g)-l(i)>170,N=y/S;
      return S&&!v&&Cn(N)>.1?N:0
    }
    return {
      pointerDown:d,pointerMove:f,pointerUp:m,readPoint:c
    }
    
  }
  function ote() {
    function e(n) {
      const {
        offsetTop:s,offsetLeft:i,offsetWidth:l,offsetHeight:c
      }
      =n;
      return {
        top:s,right:i+l,bottom:s+c,left:i,width:l,height:c
      }
      
    }
    return {
      measure:e
    }
    
  }
  function lte(e) {
    function t(s) {
      return e*(s/100)
    }
    return {
      measure:t
    }
    
  }
  function cte(e,t,n,s,i,l,c) {
    const d=[e].concat(s);
    let f,m,p=[],g=!1;
    function y(j) {
      return i.measureSize(c.measure(j))
    }
    function S(j) {
      if(!l)return;
      m=y(e),p=s.map(y);
      function _(k) {
        for(const C of k) {
          if(g)return;
          const A=C.target===e,U=s.indexOf(C.target),B=A?m:p[U],R=y(A?e:s[U]);
          if(Cn(R-B)>=.5) {
            j.reInit(),t.emit("resize");
            break
          }
          
        }
        
      }
      f=new ResizeObserver(k=> {
        (jp(l)||l(j,k))&&_(k)
      }),n.requestAnimationFrame(()=> {
        d.forEach(k=>f.observe(k))
      })
    }
    function v() {
      g=!0,f&&f.disconnect()
    }
    return {
      init:S,destroy:v
    }
    
  }
  function ute(e,t,n,s,i,l) {
    let c=0,d=0,f=i,m=l,p=e.get(),g=0;
    function y() {
      const B=s.get()-e.get(),R=!f;
      let L=0;
      return R?(c=0,n.set(s),e.set(s),L=B):(n.set(e),c+=B/f,c*=m,p+=c,e.add(c),L=p-g),d=_w(L),g=p,U
    }
    function S() {
      const B=s.get()-t.get();
      return Cn(B)<.001
    }
    function v() {
      return f
    }
    function N() {
      return d
    }
    function j() {
      return c
    }
    function _() {
      return C(i)
    }
    function k() {
      return A(l)
    }
    function C(B) {
      return f=B,U
    }
    function A(B) {
      return m=B,U
    }
    const U= {
      direction:N,duration:v,velocity:j,seek:y,settled:S,useBaseFriction:k,useBaseDuration:_,useFriction:A,useDuration:C
    };
    return U
  }
  function dte(e,t,n,s,i) {
    const l=i.measure(10),c=i.measure(50),d=rl(.1,.99);
    let f=!1;
    function m() {
      return!(f||!e.reachedAny(n.get())||!e.reachedAny(t.get()))
    }
    function p(S) {
      if(!m())return;
      const v=e.reachedMin(t.get())?"min":"max",N=Cn(e[v]-t.get()),j=n.get()-t.get(),_=d.constrain(N/c);
      n.subtract(j*_),!S&&Cn(j)<l&&(n.set(e.constrain(n.get())),s.useDuration(25).useBaseFriction())
    }
    function g(S) {
      f=!S
    }
    return {
      shouldConstrain:m,constrain:p,toggleActive:g
    }
    
  }
  function hte(e,t,n,s,i) {
    const l=rl(-t+e,0),c=g(),d=p(),f=y();
    function m(v,N) {
      return ed(v,N)<=1
    }
    function p() {
      const v=c[0],N=oa(c),j=c.lastIndexOf(v),_=c.indexOf(N)+1;
      return rl(j,_)
    }
    function g() {
      return n.map((v,N)=> {
        const {
          min:j,max:_
        }
        =l,k=l.constrain(v),C=!N,A=Tw(n,N);
        return C?_:A||m(j,k)?j:m(_,k)?_:k
      }).map(v=>parseFloat(v.toFixed(3)))
    }
    function y() {
      if(t<=e+i)return[l.max];
      if(s==="keepSnaps")return c;
      const {
        min:v,max:N
      }
      =d;
      return c.slice(v,N)
    }
    return {
      snapsContained:f,scrollContainLimit:d
    }
    
  }
  function fte(e,t,n) {
    const s=t[0],i=n?s-e:oa(t);
    return {
      limit:rl(i,s)
    }
    
  }
  function mte(e,t,n,s) {
    const l=t.min+.1,c=t.max+.1, {
      reachedMin:d,reachedMax:f
    }
    =rl(l,c);
    function m(y) {
      return y===1?f(n.get()):y===-1?d(n.get()):!1
    }
    function p(y) {
      if(!m(y))return;
      const S=e*(y*-1);
      s.forEach(v=>v.add(S))
    }
    return {
      loop:p
    }
    
  }
  function pte(e) {
    const {
      max:t,length:n
    }
    =e;
    function s(l) {
      const c=l-t;
      return n?c/-n:0
    }
    return {
      get:s
    }
    
  }
  function gte(e,t,n,s,i) {
    const {
      startEdge:l,endEdge:c
    }
    =e, {
      groupSlides:d
    }
    =i,f=g().map(t.measure),m=y(),p=S();
    function g() {
      return d(s).map(N=>oa(N)[c]-N[0][l]).map(Cn)
    }
    function y() {
      return s.map(N=>n[l]-N[l]).map(N=>-Cn(N))
    }
    function S() {
      return d(m).map(N=>N[0]).map((N,j)=>N+f[j])
    }
    return {
      snaps:m,snapsAligned:p
    }
    
  }
  function xte(e,t,n,s,i,l) {
    const {
      groupSlides:c
    }
    =i, {
      min:d,max:f
    }
    =s,m=p();
    function p() {
      const y=c(l),S=!e||t==="keepSnaps";
      return n.length===1?[l]:S?y:y.slice(d,f).map((v,N,j)=> {
        const _=!N,k=Tw(j,N);
        if(_) {
          const C=oa(j[0])+1;
          return ET(C)
        }
        if(k) {
          const C=Pd(l)-oa(j)[0]+1;
          return ET(C,oa(j)[0])
        }
        return v
      })
    }
    return {
      slideRegistry:m
    }
    
  }
  function bte(e,t,n,s,i) {
    const {
      reachedAny:l,removeOffset:c,constrain:d
    }
    =s;
    function f(v) {
      return v.concat().sort((N,j)=>Cn(N)-Cn(j))[0]
    }
    function m(v) {
      const N=e?c(v):d(v),j=t.map((k,C)=>( {
        diff:p(k-N,0),index:C
      })).sort((k,C)=>Cn(k.diff)-Cn(C.diff)), {
        index:_
      }
      =j[0];
      return {
        index:_,distance:N
      }
      
    }
    function p(v,N) {
      const j=[v,v+n,v-n];
      if(!e)return v;
      if(!N)return f(j);
      const _=j.filter(k=>_w(k)===N);
      return _.length?f(_):oa(j)-n
    }
    function g(v,N) {
      const j=t[v]-i.get(),_=p(j,N);
      return {
        index:v,distance:_
      }
      
    }
    function y(v,N) {
      const j=i.get()+v, {
        index:_,distance:k
      }
      =m(j),C=!e&&l(j);
      if(!N||C)return {
        index:_,distance:v
      };
      const A=t[_]-k,U=v+p(A,0);
      return {
        index:_,distance:U
      }
      
    }
    return {
      byDistance:y,byIndex:g,shortcut:p
    }
    
  }
  function yte(e,t,n,s,i,l,c) {
    function d(g) {
      const y=g.distance,S=g.index!==t.get();
      l.add(y),y&&(s.duration()?e.start():(e.update(),e.render(1),e.update())),S&&(n.set(t.get()),t.set(g.index),c.emit("select"))
    }
    function f(g,y) {
      const S=i.byDistance(g,y);
      d(S)
    }
    function m(g,y) {
      const S=t.clone().set(g),v=i.byIndex(S.get(),y);
      d(v)
    }
    return {
      distance:f,index:m
    }
    
  }
  function vte(e,t,n,s,i,l,c,d) {
    const f= {
      passive:!0,capture:!0
    };
    let m=0;
    function p(S) {
      if(!d)return;
      function v(N) {
        if(new Date().getTime()-m>10)return;
        c.emit("slideFocusStart"),e.scrollLeft=0;
        const k=n.findIndex(C=>C.includes(N));
        kw(k)&&(i.useDuration(0),s.index(k,0),c.emit("slideFocus"))
      }
      l.add(document,"keydown",g,!1),t.forEach((N,j)=> {
        l.add(N,"focus",_=> {
          (jp(d)||d(S,_))&&v(j)
        },f)
      })
    }
    function g(S) {
      S.code==="Tab"&&(m=new Date().getTime())
    }
    return {
      init:p
    }
    
  }
  function Vu(e) {
    let t=e;
    function n() {
      return t
    }
    function s(f) {
      t=c(f)
    }
    function i(f) {
      t+=c(f)
    }
    function l(f) {
      t-=c(f)
    }
    function c(f) {
      return kw(f)?f:f.get()
    }
    return {
      get:n,set:s,add:i,subtract:l
    }
    
  }
  function Z3(e,t) {
    const n=e.scroll==="x"?c:d,s=t.style;
    let i=null,l=!1;
    function c(y) {
      return`translate3d(${y}px,0px,0px)`
    }
    function d(y) {
      return`translate3d(0px,${y}px,0px)`
    }
    function f(y) {
      if(l)return;
      const S=tte(e.direction(y));
      S!==i&&(s.transform=n(S),i=S)
    }
    function m(y) {
      l=!y
    }
    function p() {
      l||(s.transform="",t.getAttribute("style")||t.removeAttribute("style"))
    }
    return {
      clear:p,to:f,toggleActive:m
    }
    
  }
  function wte(e,t,n,s,i,l,c,d,f) {
    const p=wd(i),g=wd(i).reverse(),y=_().concat(k());
    function S(R,L) {
      return R.reduce(($,M)=>$-i[M],L)
    }
    function v(R,L) {
      return R.reduce(($,M)=>S($,L)>0?$.concat([M]):$,[])
    }
    function N(R) {
      return l.map((L,$)=>( {
        start:L-s[$]+.5+R,end:L+t-.5+R
      }))
    }
    function j(R,L,$) {
      const M=N(L);
      return R.map(H=> {
        const ae=$?0:-n,te=$?n:0,K=$?"end":"start",V=M[H][K];
        return {
          index:H,loopPoint:V,slideLocation:Vu(-1),translate:Z3(e,f[H]),target:()=>d.get()>V?ae:te
        }
        
      })
    }
    function _() {
      const R=c[0],L=v(g,R);
      return j(L,n,!1)
    }
    function k() {
      const R=t-c[0]-1,L=v(p,R);
      return j(L,-n,!0)
    }
    function C() {
      return y.every(( {
        index:R
      })=> {
        const L=p.filter($=>$!==R);
        return S(L,t)<=.1
      })
    }
    function A() {
      y.forEach(R=> {
        const {
          target:L,translate:$,slideLocation:M
        }
        =R,H=L();
        H!==M.get()&&($.to(H),M.set(H))
      })
    }
    function U() {
      y.forEach(R=>R.translate.clear())
    }
    return {
      canLoop:C,clear:U,loop:A,loopPoints:y
    }
    
  }
  function Ste(e,t,n) {
    let s,i=!1;
    function l(f) {
      if(!n)return;
      function m(p) {
        for(const g of p)if(g.type==="childList") {
          f.reInit(),t.emit("slidesChanged");
          break
        }
        
      }
      s=new MutationObserver(p=> {
        i||(jp(n)||n(f,p))&&m(p)
      }),s.observe(e, {
        childList:!0
      })
    }
    function c() {
      s&&s.disconnect(),i=!0
    }
    return {
      init:l,destroy:c
    }
    
  }
  function Nte(e,t,n,s) {
    const i= {
      
    };
    let l=null,c=null,d,f=!1;
    function m() {
      d=new IntersectionObserver(v=> {
        f||(v.forEach(N=> {
          const j=t.indexOf(N.target);
          i[j]=N
        }),l=null,c=null,n.emit("slidesInView"))
      }, {
        root:e.parentElement,threshold:s
      }),t.forEach(v=>d.observe(v))
    }
    function p() {
      d&&d.disconnect(),f=!0
    }
    function g(v) {
      return Sd(i).reduce((N,j)=> {
        const _=parseInt(j), {
          isIntersecting:k
        }
        =i[_];
        return(v&&k||!v&&!k)&&N.push(_),N
      },[])
    }
    function y(v=!0) {
      if(v&&l)return l;
      if(!v&&c)return c;
      const N=g(v);
      return v&&(l=N),v||(c=N),N
    }
    return {
      init:m,destroy:p,get:y
    }
    
  }
  function jte(e,t,n,s,i,l) {
    const {
      measureSize:c,startEdge:d,endEdge:f
    }
    =e,m=n[0]&&i,p=v(),g=N(),y=n.map(c),S=j();
    function v() {
      if(!m)return 0;
      const k=n[0];
      return Cn(t[d]-k[d])
    }
    function N() {
      if(!m)return 0;
      const k=l.getComputedStyle(oa(s));
      return parseFloat(k.getPropertyValue(`margin-${f}`))
    }
    function j() {
      return n.map((k,C,A)=> {
        const U=!C,B=Tw(A,C);
        return U?y[C]+p:B?y[C]+g:A[C+1][d]-k[d]
      }).map(Cn)
    }
    return {
      slideSizes:y,slideSizesWithGaps:S,startGap:p,endGap:g
    }
    
  }
  function kte(e,t,n,s,i,l,c,d,f) {
    const {
      startEdge:m,endEdge:p,direction:g
    }
    =e,y=kw(n);
    function S(_,k) {
      return wd(_).filter(C=>C%k===0).map(C=>_.slice(C,C+k))
    }
    function v(_) {
      return _.length?wd(_).reduce((k,C,A)=> {
        const U=oa(k)||0,B=U===0,R=C===Pd(_),L=i[m]-l[U][m],$=i[m]-l[C][p],M=!s&&B?g(c):0,H=!s&&R?g(d):0,ae=Cn($-H-(L+M));
        return A&&ae>t+f&&k.push(C),R&&k.push(_.length),k
      },[]).map((k,C,A)=> {
        const U=Math.max(A[C-1]||0);
        return _.slice(U,k)
      }):[]
    }
    function N(_) {
      return y?S(_,n):v(_)
    }
    return {
      groupSlides:N
    }
    
  }
  function _te(e,t,n,s,i,l,c) {
    const {
      align:d,axis:f,direction:m,startIndex:p,loop:g,duration:y,dragFree:S,dragThreshold:v,inViewThreshold:N,slidesToScroll:j,skipSnaps:_,containScroll:k,watchResize:C,watchSlides:A,watchDrag:U,watchFocus:B
    }
    =l,R=2,L=ote(),$=L.measure(t),M=n.map(L.measure),H=rte(f,m),ae=H.measureSize($),te=lte(ae),K=nte(d,ae),V=!g&&!!k,E=g||!!k, {
      slideSizes:F,slideSizesWithGaps:P,startGap:Y,endGap:q
    }
    =jte(H,$,M,n,E,i),D=kte(H,ae,j,g,$,M,Y,q,R), {
      snaps:X,snapsAligned:fe
    }
    =gte(H,K,$,M,D),ue=-oa(X)+oa(P), {
      snapsContained:he,scrollContainLimit:ve
    }
    =hte(ae,ue,fe,k,R),be=V?he:fe, {
      limit:Ae
    }
    =fte(ue,be,g),Te=Y3(Pd(be),p,g),Ve=Te.clone(),le=wd(n),oe=( {
      dragHandler:Rt,scrollBody:nt,scrollBounds:Zt,options: {
        loop:I
      }
      
    })=> {
      I||Zt.constrain(Rt.pointerDown()),nt.seek()
    },je=( {
      scrollBody:Rt,translate:nt,location:Zt,offsetLocation:I,previousLocation:Z,scrollLooper:Q,slideLooper:xe,dragHandler:ke,animation:Ee,eventHandler:De,scrollBounds:Pe,options: {
        loop:qe
      }
      
    },Xe)=> {
      const xt=Rt.settled(),Xt=!Pe.shouldConstrain(),qt=qe?xt:xt&&Xt,ut=qt&&!ke.pointerDown();
      ut&&Ee.stop();
      const Gt=Zt.get()*Xe+Z.get()*(1-Xe);
      I.set(Gt),qe&&(Q.loop(Rt.direction()),xe.loop()),nt.to(I.get()),ut&&De.emit("settle"),qt||De.emit("scroll")
    },$e=ste(s,i,()=>oe(zt),Rt=>je(zt,Rt)),Ge=.68,St=be[Te.get()],ge=Vu(St),Re=Vu(St),G=Vu(St),se=Vu(St),Le=ute(ge,G,Re,se,y,Ge),Ne=bte(g,be,ue,Ae,se),Ke=yte($e,Te,Ve,Le,Ne,se,c),We=pte(Ae),He=Nd(),ot=Nte(t,n,c,N), {
      slideRegistry:Qe
    }
    =xte(V,k,be,ve,D,le),mt=vte(e,n,Qe,Ke,Le,He,c,B),zt= {
      ownerDocument:s,ownerWindow:i,eventHandler:c,containerRect:$,slideRects:M,animation:$e,axis:H,dragHandler:ate(H,e,s,i,se,ite(H,i),ge,$e,Ke,Le,Ne,Te,c,te,S,v,_,Ge,U),eventStore:He,percentOfView:te,index:Te,indexPrevious:Ve,limit:Ae,location:ge,offsetLocation:G,previousLocation:Re,options:l,resizeHandler:cte(t,c,i,n,H,C,L),scrollBody:Le,scrollBounds:dte(Ae,G,se,Le,te),scrollLooper:mte(ue,Ae,G,[ge,G,Re,se]),scrollProgress:We,scrollSnapList:be.map(We.get),scrollSnaps:be,scrollTarget:Ne,scrollTo:Ke,slideLooper:wte(H,ae,ue,F,P,X,be,G,n),slideFocus:mt,slidesHandler:Ste(t,c,A),slidesInView:ot,slideIndexes:le,slideRegistry:Qe,slidesToScroll:D,target:se,translate:Z3(H,t)
    };
    return zt
  }
  function Tte() {
    let e= {
      
    },t;
    function n(m) {
      t=m
    }
    function s(m) {
      return e[m]||[]
    }
    function i(m) {
      return s(m).forEach(p=>p(t,m)),f
    }
    function l(m,p) {
      return e[m]=s(m).concat([p]),f
    }
    function c(m,p) {
      return e[m]=s(m).filter(g=>g!==p),f
    }
    function d() {
      e= {
        
      }
      
    }
    const f= {
      init:n,emit:i,off:c,on:l,clear:d
    };
    return f
  }
  const Ete= {
    align:"center",axis:"x",container:null,slides:null,containScroll:"trimSnaps",direction:"ltr",slidesToScroll:1,inViewThreshold:0,breakpoints: {
      
    },dragFree:!1,dragThreshold:10,loop:!1,skipSnaps:!1,duration:25,startIndex:0,active:!0,watchDrag:!0,watchResize:!0,watchSlides:!0,watchFocus:!0
  };
  function Cte(e) {
    function t(l,c) {
      return W3(l,c|| {
        
      })
    }
    function n(l) {
      const c=l.breakpoints|| {
        
      },d=Sd(c).filter(f=>e.matchMedia(f).matches).map(f=>c[f]).reduce((f,m)=>t(f,m), {
        
      });
      return t(l,d)
    }
    function s(l) {
      return l.map(c=>Sd(c.breakpoints|| {
        
      })).reduce((c,d)=>c.concat(d),[]).map(e.matchMedia)
    }
    return {
      mergeOptions:t,optionsAtMedia:n,optionsMediaQueries:s
    }
    
  }
  function Ate(e) {
    let t=[];
    function n(l,c) {
      return t=c.filter(( {
        options:d
      })=>e.optionsAtMedia(d).active!==!1),t.forEach(d=>d.init(l,e)),c.reduce((d,f)=>Object.assign(d, {
        [f.name]:f
      }), {
        
      })
    }
    function s() {
      t=t.filter(l=>l.destroy())
    }
    return {
      init:n,destroy:s
    }
    
  }
  function Ym(e,t,n) {
    const s=e.ownerDocument,i=s.defaultView,l=Cte(i),c=Ate(l),d=Nd(),f=Tte(), {
      mergeOptions:m,optionsAtMedia:p,optionsMediaQueries:g
    }
    =l, {
      on:y,off:S,emit:v
    }
    =f,N=H;
    let j=!1,_,k=m(Ete,Ym.globalOptions),C=m(k),A=[],U,B,R;
    function L() {
      const {
        container:le,slides:oe
      }
      =C;
      B=(R0(le)?e.querySelector(le):le)||e.children[0];
      const $e=R0(oe)?B.querySelectorAll(oe):oe;
      R=[].slice.call($e||B.children)
    }
    function $(le) {
      const oe=_te(e,B,R,s,i,le,f);
      if(le.loop&&!oe.slideLooper.canLoop()) {
        const je=Object.assign( {
          
        },le, {
          loop:!1
        });
        return $(je)
      }
      return oe
    }
    function M(le,oe) {
      j||(k=m(k,le),C=p(k),A=oe||A,L(),_=$(C),g([k,...A.map(( {
        options:je
      })=>je)]).forEach(je=>d.add(je,"change",H)),C.active&&(_.translate.to(_.location.get()),_.animation.init(),_.slidesInView.init(),_.slideFocus.init(Ve),_.eventHandler.init(Ve),_.resizeHandler.init(Ve),_.slidesHandler.init(Ve),_.options.loop&&_.slideLooper.loop(),B.offsetParent&&R.length&&_.dragHandler.init(Ve),U=c.init(Ve,A)))
    }
    function H(le,oe) {
      const je=D();
      ae(),M(m( {
        startIndex:je
      },le),oe),f.emit("reInit")
    }
    function ae() {
      _.dragHandler.destroy(),_.eventStore.clear(),_.translate.clear(),_.slideLooper.clear(),_.resizeHandler.destroy(),_.slidesHandler.destroy(),_.slidesInView.destroy(),_.animation.destroy(),c.destroy(),d.clear()
    }
    function te() {
      j||(j=!0,d.clear(),ae(),f.emit("destroy"),f.clear())
    }
    function K(le,oe,je) {
      !C.active||j||(_.scrollBody.useBaseFriction().useDuration(oe===!0?0:C.duration),_.scrollTo.index(le,je||0))
    }
    function V(le) {
      const oe=_.index.add(1).get();
      K(oe,le,-1)
    }
    function E(le) {
      const oe=_.index.add(-1).get();
      K(oe,le,1)
    }
    function F() {
      return _.index.add(1).get()!==D()
    }
    function P() {
      return _.index.add(-1).get()!==D()
    }
    function Y() {
      return _.scrollSnapList
    }
    function q() {
      return _.scrollProgress.get(_.offsetLocation.get())
    }
    function D() {
      return _.index.get()
    }
    function X() {
      return _.indexPrevious.get()
    }
    function fe() {
      return _.slidesInView.get()
    }
    function ue() {
      return _.slidesInView.get(!1)
    }
    function he() {
      return U
    }
    function ve() {
      return _
    }
    function be() {
      return e
    }
    function Ae() {
      return B
    }
    function Te() {
      return R
    }
    const Ve= {
      canScrollNext:F,canScrollPrev:P,containerNode:Ae,internalEngine:ve,destroy:te,off:S,on:y,emit:v,plugins:he,previousScrollSnap:X,reInit:N,rootNode:be,scrollNext:V,scrollPrev:E,scrollProgress:q,scrollSnapList:Y,scrollTo:K,selectedScrollSnap:D,slideNodes:Te,slidesInView:fe,slidesNotInView:ue
    };
    return M(t,n),setTimeout(()=>f.emit("init"),0),Ve
  }
  Ym.globalOptions=void 0;
  function Ew(e= {
    
  },t=[]) {
    const n=w.useRef(e),s=w.useRef(t),[i,l]=w.useState(),[c,d]=w.useState(),f=w.useCallback(()=> {
      i&&i.reInit(n.current,s.current)
    },[i]);
    return w.useEffect(()=> {
      jw(n.current,e)||(n.current=e,f())
    },[e,f]),w.useEffect(()=> {
      Jee(s.current,t)||(s.current=t,f())
    },[t,f]),w.useEffect(()=> {
      if(Qee()&&c) {
        Ym.globalOptions=Ew.globalOptions;
        const m=Ym(c,n.current,s.current);
        return l(m),()=>m.destroy()
      }
      else l(void 0)
    },[c,l]),[d,i]
  }
  Ew.globalOptions=void 0;
  const Ote="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAAAAAAdeMxuAAAACXBIWXMAAAsSAAALEgHS3X78AAAB/ElEQVRYw82Xa5XDIBCF4wAJSEBCJCABCUhAAhKQgIRIQAISkJBNU9iQKUyGpme3/ONw+oU7zON2Wj+wpnW6vb4Ncisefw3xmotbkOQke2iPb0OCFSWA9j3IJqJ6BTEOKSKqlcYgwYhGQrgBiFe8nVWSCIlOIrmZSBCBJ7gjQbBrTNJFEsT2AFx5ctrHJkGYMFQ7L0FhtQhaYF/06NPLz8QnbqdGeflESzao55y+jgbRAGJO6StpkICnW6LVDkchngbRKETRIAsKYcRWwIb0dCAKuYd0iQbxvRrUfqCztfQIG8aGF2wqTNUivAoUiAMQC5qnpkASlJJzWecS4qSRAfXENXlVRSpQIFCPlN0m04ekC1cjSBPwYnLU/qAPsRcQS4FEuh5koON6mCJBTJ/A9UK1Fh3CbOOAyeEtES6NOSWNi6BBAi6C6NnYrwif3jbDe5MUOtxy1H6SiIh/9PbXkO/+5zXPsxiCAI3b2A7Z3otidPKcNq19G7JPuuXo2bBdgf0BgS1nq0CZcrvN56y0q2q/oJBopKh8W/mRBnvTkAOczPKcNtC8QHVNyKPwc9VFfnbcghqTXL6zTeW+z3NRrlLJWecO5DHg0vZJFnIQynkjsGdILWi3vGnPlcAqSDhgdfPqJZsvRoBVX56WPEyOOFuGpr0YTfsvqeIPrB/5W5xKtBk9TgAAAABJRU5ErkJggg==",kp=w.memo(( {
    product:e,onClick:t,topBadge:n,tag:s,className:i
  })=> {
    const {
      t:l
    }
    =Pt(),c=Jr(M=>M.addToCart),d=xr(M=>M.addToWishlist),f=xr(M=>M.removeFromWishlist),m=xr(M=>M.wishlistIds),[p,g]=w.useState(!1),[y,S]=w.useState(!1),v=w.useMemo(()=>e.id?m.has(e.id):!1,[e.id,m]),N=w.useCallback(()=> {
      t&&t(e)
    },[t,e]),j=w.useCallback(async M=> {
      if(M.stopPropagation(),!(!e.id||y)) {
        S(!0);
        try {
          v?(await f(e.id),Be.info(l("productDetail.removedFromWishlist"))):(await d(e.id),Be.success(l("productDetail.addedToWishlist")))
        }
        catch(H) {
          console.error("Failed to toggle wishlist on card:",H)
        }
        finally {
          S(!1)
        }
        
      }
      
    },[e.id,v,y,d,f,l]),_=w.useCallback(async M=> {
      if(M.stopPropagation(),!(!e.id||p)) {
        g(!0);
        try {
          await c(e.id,1),Be.success(l("productDetail.addedToCart"))
        }
        catch(H) {
          console.error("Failed to add product to cart from card:",H)
        }
        finally {
          g(!1)
        }
        
      }
      
    },[e.id,p,c,l]),k=w.useMemo(()=>s!==void 0?s:e.tags&&e.tags.length>0?e.tags[0].name:e.categories&&e.categories.length>0?e.categories[0].name:null,[s,e]),C=w.useMemo(()=> {
      if(n!==void 0)return {
        text:n,icon:a.jsx(Aa, {
          className:"w-3 h-3 text-[#FFD25F]"
        })
      };
      const M=e.fulfillmentType||(e.variants&&e.variants.length>0?e.variants[0].fulfillmentType:null)||(e.variations&&e.variations.length>0?e.variations[0].fulfillmentType:null);
      if(M)switch(M) {
        case Bt.RANDOM_KEY:return {
          text:"Random Key",icon:a.jsx(fn, {
            className:"w-3 h-3 text-[#F06A4F]"
          })
        };
        case Bt.RENTAL_ACCOUNT:case Bt.SINGLE_ACCOUNT:return {
          text:"Thuê Game",icon:a.jsx(gr, {
            className:"w-3 h-3 text-[#8DEAF0]"
          })
        };
        case Bt.EXTERNAL_KEY:return {
          text:"Steam Key",icon:a.jsx(Aa, {
            className:"w-3 h-3 text-[#FFD25F]"
          })
        };
        default:return null
      }
      return null
    },[n,e]), {
      currentPrice:A,oldPrice:U,hasDiscount:B,discountPercent:R
    }
    =w.useMemo(()=> {
      const M=E=> {
        if(E==null||E==="")return null;
        const F=typeof E=="string"?parseFloat(E):E;
        return isNaN(F)?null:F
      },H=(e.variants&&e.variants.length>0?e.variants:e.variations)??[],ae=H.length>0?H:[e];
      let te=null,K=0;
      for(const E of ae) {
        const F=M(E.regularPrice)??0,P=M(E.salePrice),Y=P!==null&&P>0&&F>P?P:null;
        Y!==null&&(te===null||Y<te)&&(te=Y,K=F)
      }
      if(te===null) {
        let E=null;
        for(const F of ae) {
          const P=M(F.regularPrice)??0;
          (E===null||P<E)&&(E=P)
        }
        return {
          currentPrice:E??0,oldPrice:null,hasDiscount:!1,discountPercent:0
        }
        
      }
      const V=K>0?Math.round((K-te)/K*100):0;
      return {
        currentPrice:te,oldPrice:K,hasDiscount:!0,discountPercent:V
      }
      
    },[e]),L=w.useMemo(()=> {
      if(e.thumbnail?.url)return e.thumbnail.url;
      const M=e.variants&&e.variants.length>0?e.variants:e.variations;
      return M&&M.length>0&&M[0].thumbnail?.url||null
    },[e]),$=w.useMemo(()=> {
      let M=0;
      const H=e.id?String(e.id):e.title||"";
      for(let V=0;
      V<H.length;
      V++)M=(M<<5)-M+H.charCodeAt(V),M|=0;
      const ae=Math.abs(M),te=(ae%70/10+.5).toFixed(2),K=(ae%40/10+6.5).toFixed(2);
      return {
        animationDelay:`${te}s`,animationDuration:`${K}s`
      }
      
    },[e.id,e.title]);
    return a.jsxs("div", {
      onClick:N,className:et("group relative flex flex-col justify-between rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-primary/20 cursor-pointer overflow-hidden",i),children:[a.jsxs("div", {
        className:"relative w-full aspect-[4/5] overflow-hidden bg-surface rounded-t-2xl",children:[a.jsxs("div", {
          className:"absolute inset-0 pointer-events-none overflow-hidden z-10",children:[a.jsx("div", {
            className:"absolute top-0 bottom-0 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/20 via-white/50 via-white/20 dark:via-white/5 dark:via-white/30 dark:via-white/5 to-transparent animate-mirror-shine",style:$
          }),a.jsx("div", {
            className:"absolute top-0 bottom-0 -left-full w-2/3 bg-gradient-to-r from-transparent via-white/20 via-white/70 via-white/20 dark:via-white/10 dark:via-white/50 dark:via-white/10 to-transparent -skew-x-25 transition-transform duration-0 group-hover:duration-700 ease-out group-hover:translate-x-[450%]"
          })]
        }),a.jsx("div", {
          className:"absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/80 to-transparent pointer-events-none z-10"
        }),C&&a.jsxs("div", {
          className:"absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/65 backdrop-blur-md border border-white/15 group-hover:border-white/25 transition-all duration-200 shadow-sm",children:[C.icon,a.jsx("span", {
            className:"text-[10.5px] font-bold text-white tracking-wide",children:C.text
          })]
        }),a.jsx("button", {
          type:"button",onClick:j,disabled:y,"aria-label":l("sidebar.wishlist"),title:l("sidebar.wishlist"),className:et("absolute top-2.5 right-2.5 z-20 p-2 rounded-xl backdrop-blur-md border transition-all duration-200 cursor-pointer hover:scale-110 active:scale-90 disabled:opacity-50 shadow-sm",v?"bg-rose-500/20 border-rose-500/40 text-rose-500":"bg-black/40 hover:bg-black/60 border-white/20 text-white/70 hover:text-rose-400 hover:border-rose-400/40"),children:y?a.jsx(gn, {
            className:"w-3.5 h-3.5 animate-spin text-rose-500"
          }):a.jsx(ld, {
            className:et("w-3.5 h-3.5 transition-colors",v?"fill-rose-500 text-rose-500":"text-current")
          })
        }),L?a.jsx(fi, {
          src:L,alt:e.title,fallbackTitle:e.title,className:"w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
        }):a.jsxs("div", {
          className:"w-full h-full bg-surface-2 flex flex-col items-center justify-center p-3 text-center group-hover:scale-105 transition-transform duration-300",children:[a.jsx(Un, {
            className:"w-8 h-8 text-text-muted mb-1"
          }),a.jsx("span", {
            className:"text-[10px] font-medium text-text-muted line-clamp-1",children:e.title
          })]
        })]
      }),a.jsxs("div", {
        className:"p-3 flex-1 flex flex-col justify-between gap-2 z-10 bg-card",children:[k&&a.jsx("div", {
          children:a.jsx("span", {
            className:"inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-2 border border-border text-accent-cyan shadow-sm uppercase tracking-wide",children:k
          })
        }),a.jsx("h3", {
          className:"text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug",children:e.title
        }),a.jsxs("div", {
          className:"pt-1 flex items-center justify-between gap-2 border-t border-border/40",children:[a.jsxs("div", {
            className:"flex items-center gap-1.5 flex-wrap min-w-0",children:[B&&R>0&&a.jsxs("span", {
              className:"px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-sale text-white shadow-sm",children:["-",R,"%"]
            }),A===0?a.jsx("button", {
              type:"button",onClick:M=> {
                M.stopPropagation(),dc(Is.ZALO_URL)
              },className:"text-xs font-bold text-primary hover:underline cursor-pointer truncate",children:l("store.contactZalo")
            }):a.jsxs("div", {
              className:"flex flex-col gap-0",children:[B&&U!==null&&a.jsxs("span", {
                className:"text-[10px] text-text-muted line-through font-medium",children:[U.toLocaleString("vi-VN")," ₫"]
              }),a.jsxs("span", {
                className:"text-xs sm:text-sm font-black bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent tracking-tight",children:[A.toLocaleString("vi-VN")," ₫"]
              })]
            })]
          }),a.jsx("button", {
            type:"button",onClick:_,disabled:p,title:l("productDetail.addToCart"),"aria-label":l("productDetail.addToCart"),className:"p-2 rounded-xl bg-surface hover:bg-gradient-to-r hover:from-[#FF1B70] hover:via-[#FF6B4A] hover:to-[#FFB800] hover:text-white hover:border-transparent hover:shadow-[0_0_15px_rgba(255,27,112,0.45)] border border-border text-text-muted transition-all duration-200 shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 shadow-sm",children:p?a.jsx(gn, {
              className:"w-4 h-4 animate-spin shrink-0 text-primary"
            }):a.jsx(no, {
              className:"w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
            })
          })]
        })]
      })]
    })
  }),Xi= {
    getProducts:async e=> {
      const {
        data:t
      }
      =await bt.get("/products", {
        params:e
      });
      return t
    },getProductById:async e=> {
      const {
        data:t
      }
      =await bt.get(`/products/${e}`);
      return t
    },getProductBySlug:async e=> {
      const {
        data:t
      }
      =await bt.get(`/products/slug/${e}`);
      return t
    },createProduct:async e=> {
      const {
        data:t
      }
      =await bt.post("/products",e);
      return t
    },updateProduct:async(e,t)=> {
      const {
        data:n
      }
      =await bt.patch(`/products/${e}`,t);
      return n
    },deleteProduct:async e=> {
      const {
        data:t
      }
      =await bt.delete(`/products/${e}`);
      return t
    }
    
  },CT= {
    getReviews:async e=> {
      try {
        const {
          data:t
        }
        =await bt.get("/product-reviews", {
          params:e
        });
        return t
      }
      catch(t) {
        return console.warn("Failed to fetch product reviews:",t), {
          data:[],total:0,take:e?.take||10,skip:e?.skip||0
        }
        
      }
      
    },createReview:async e=> {
      const {
        data:t
      }
      =await bt.post("/product-reviews",e);
      return t
    }
    
  },Rte=()=> {
    const {
      t:e
    }
    =Pt(),t=ss(), {
      slug:n
    }
    =FL(),s=Yn(re=>re.user),i=Jr(re=>re.addToCart),l=xr(re=>re.addToWishlist),c=xr(re=>re.removeFromWishlist),d=xr(re=>re.wishlistIds),[f,m]=w.useState(null),[p,g]=w.useState(null),[y,S]=w.useState(null);
    w.useEffect(()=> {
      const re=()=> {
        window.scrollTo( {
          top:0,left:0,behavior:"instant"
        }),document.documentElement.scrollTop=0,document.body.scrollTop=0,window.__lenis?.scrollTo(0, {
          immediate:!0
        })
      };
      re();
      const Ie=setTimeout(re,50);
      return()=>clearTimeout(Ie)
    },[n]);
    const {
      data:v,isLoading:N,error:j,mutate:_
    }
    =ci(n?er.productDetail(n):null,async()=> {
      const Ie=/^\d+$/.test(n)?await Xi.getProductById(Number(n)):await Xi.getProductBySlug(n);
      return Ie?.variants&&Ie.variants.length>0?Ie.variants=[...Ie.variants].sort((Je,vt)=> {
        const Dt=jt=> {
          const bn=typeof jt.regularPrice=="string"?parseFloat(jt.regularPrice):jt.regularPrice??0,En=jt.salePrice!==null&&jt.salePrice!==void 0&&jt.salePrice!==""?typeof jt.salePrice=="string"?parseFloat(String(jt.salePrice)):Number(jt.salePrice):null;
          return En!==null&&En>0&&bn>En?En:bn
        };
        return Dt(Je)-Dt(vt)
      }):Ie?.variations&&Ie.variations.length>0&&(Ie.variations=[...Ie.variations].sort((Je,vt)=> {
        const Dt=jt=> {
          const bn=typeof jt.regularPrice=="string"?parseFloat(jt.regularPrice):jt.regularPrice??0,En=jt.salePrice!==null&&jt.salePrice!==void 0&&jt.salePrice!==""?typeof jt.salePrice=="string"?parseFloat(String(jt.salePrice)):Number(jt.salePrice):null;
          return En!==null&&En>0&&bn>En?En:bn
        };
        return Dt(Je)-Dt(vt)
      })),Ie
    }, {
      revalidateOnFocus:!1,onSuccess:re=> {
        re.thumbnail?.url&&m(re.thumbnail.url);
        const Ie=re?.variants&&re.variants.length>0?re.variants:re?.variations;
        Ie&&Ie.length>0?g(Ie[0].id):g(null)
      }
      
    }),k=j?e("productDetail.notFound"):null,[C,A]=w.useState(null),[U,B]=w.useState(5),[R,L]=w.useState(0),[$,M]=w.useState(""),[H,ae]=w.useState(""),[te,K]=w.useState(""),[V,E]=w.useState(!1),F=w.useMemo(()=>v?.id?d.has(v.id):!1,[v?.id,d]),[P,Y]=w.useState(!1),[q,D]=w.useState(!1),[X,fe]=w.useState(!1),[ue,he]=w.useState(!1),ve=w.useCallback(()=> {
      fe(!0)
    },[]),be=w.useCallback(()=> {
      fe(!1)
    },[]),Ae=w.useCallback(()=> {
      he(!0)
    },[]),Te=w.useCallback(()=> {
      he(!1)
    },[]),Ve=w.useCallback(async()=> {
      if(v?.id) {
        Y(!0);
        try {
          await i(v.id,1,p??void 0),Be.success(e("productDetail.addedToCart"))
        }
        catch(re) {
          console.error("Failed to add product to cart:",re)
        }
        finally {
          Y(!1)
        }
        
      }
      
    },[v?.id,p,i,e]),le=w.useCallback(async()=> {
      if(v?.id) {
        D(!0);
        try {
          F?(await c(v.id),Be.info(e("productDetail.removedFromWishlist"))):(await l(v.id),Be.success(e("productDetail.addedToWishlist")))
        }
        catch(re) {
          console.error("Failed to toggle wishlist:",re)
        }
        finally {
          D(!1)
        }
        
      }
      
    },[v?.id,F,l,c,e]), {
      data:oe,isLoading:je,mutate:$e
    }
    =ci(v?.id?er.productReviews(v.id):null,async()=>(await CT.getReviews( {
      productId:v.id,isApproved:!0,take:50
    }))?.data||[]),Ge=oe||[], {
      data:St
    }
    =ci(v?.id?er.productRelated(v.id):null,async()=> {
      const re=v.categories?.[0]?.id;
      let Je=((re?await Xi.getProducts( {
        categoryId:re,take:12
      }):await Xi.getProducts( {
        take:12
      }))?.data||[]).filter(vt=>vt.id!==v.id);
      if(Je.length<4) {
        const Dt=((await Xi.getProducts( {
          take:12
        }))?.data||[]).filter(jt=>jt.id!==v.id&&!Je.some(bn=>bn.id===jt.id));
        Je=[...Je,...Dt]
      }
      return Je
    }),ge=St||[],Re=w.useCallback(()=> {
      t("/store")
    },[t]),G=w.useMemo(()=>v?v.variants&&v.variants.length>0?v.variants:v.variations&&v.variations.length>0?v.variations:[]:[],[v]),se=w.useMemo(()=>!v||!p?null:G.find(re=>re.id===p)||null,[v,p,G]),Le=w.useCallback(re=> {
      if(!re)return"";
      let Ie=re.replace(/\\r\\n/g,`
`).replace(/\\n/g,`
`).replace(/\\r/g,"");
      Ie=Ie.replace(/<a\s+[^>]*href=["'](?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s"']*["'][^>]*>.*?<\/a>/gi,(vt,Dt)=>`<iframe src="https://www.youtube.com/embed/${Dt}?enablejsapi=1&rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy" class="w-full aspect-video rounded-xl border border-border/60 my-5 shadow-lg bg-black"></iframe>`);
      const Je=/(^|>|\s)(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-] {
        11
      })(?:[^\s<"']*)?/gi;return Ie=Ie.replace(Je,(vt,Dt,jt)=>Dt==='="'||vt.includes("src=")?vt:`${Dt||""}<iframe src="https://www.youtube.com/embed/${jt}?enablejsapi=1&rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy" class="w-full aspect-video rounded-xl border border-border/60 my-5 shadow-lg bg-black"></iframe>`),jT.sanitize(Ie,{ADD_TAGS:["iframe"],ADD_ATTR:["allow","allowfullscreen","frameborder","scrolling","target","src","title","class","style","referrerpolicy","loading"]})},[]),Ne=w.useMemo(()=>se||v,[se,v]),Ke=w.useCallback(re=>{if(g(re),re&&G.length>0){const Ie=G.find(Je=>Je.id===re);Ie?.thumbnail?.url&&m(Ie.thumbnail.url)}else!re&&v?.thumbnail?.url&&m(v.thumbnail.url)},[v,G]),We=w.useMemo(()=>Ne?typeof Ne.regularPrice=="string"?parseFloat(Ne.regularPrice):Ne.regularPrice??0:0,[Ne]),He=w.useMemo(()=>Ne&&Ne.salePrice!==null&&Ne.salePrice!==void 0&&Ne.salePrice!==""?typeof Ne.salePrice=="string"?parseFloat(Ne.salePrice):Ne.salePrice:null,[Ne]),ot=w.useMemo(()=>He!==null&&He>0&&We>He,[He,We]),Qe=w.useMemo(()=>ot?He:We,[ot,He,We]),mt=w.useMemo(()=>ot?We:null,[ot,We]),zt=w.useMemo(()=>!ot||We<=0||He===null?0:Math.round((We-He)/We*100),[ot,We,He]),Rt=w.useMemo(()=>Ne?.stockStatus??lm.IN_STOCK,[Ne]),nt=w.useMemo(()=>{const re=[];return v?.thumbnail?.url&&re.push(v.thumbnail.url),v?.gallery&&Array.isArray(v.gallery)&&v.gallery.forEach(Ie=>{Ie?.url&&!re.includes(Ie.url)&&re.push(Ie.url)}),re},[v]),Zt=w.useMemo(()=>{const re=v?.systemRequirements;if(!re)return"";let Ie=null;if(Array.isArray(re))Ie=re;else if(typeof re=="string"){const Je=re.trim();if(Je.startsWith("[")&&Je.endsWith("]"))try{const vt=JSON.parse(Je);Array.isArray(vt)&&(Ie=vt)}catch{}}if(Ie&&Ie.length>0){const Je=Ie.map(vt=>{if(typeof vt=="string")return`<tr><td colspan="3" class="py-2 px-3 border-b border-border/40">${vt}</td></tr>`;const Dt=vt.label||"",jt=vt.minimum||"",bn=vt.recommended||"";return`<tr class="border-b border-border/40 hover:bg-surface/50"><td class="font-bold text-text py-2.5 px-3 border-r border-border/40 w-1/4">${Dt}</td><td class="py-2.5 px-3 border-r border-border/40 w-3/8">${jt}</td><td class="py-2.5 px-3 w-3/8">${bn}</td></tr>`}).join("");return`<div class="overflow-x-auto"><table class="w-full text-left text-xs border-collapse border border-border/60 rounded-xl overflow-hidden min-w-[500px]"><thead class="bg-surface border-b border-border/60 text-text font-extrabold"><tr><th class="py-2.5 px-3 border-r border-border/60 w-1/4">${e("productDetail.systemReqColLabel")}</th><th class="py-2.5 px-3 border-r border-border/60 w-3/8">${e("productDetail.systemReqColMin")}</th><th class="py-2.5 px-3 w-3/8">${e("productDetail.systemReqColRec")}</th></tr></thead><tbody>${Je}</tbody></table></div>`}return typeof re=="string"?re:""},[v?.systemRequirements,e]),[I,Z]=w.useState(!1),[Q,xe]=w.useState(!1),[ke,Ee]=w.useState(!1),[De,Pe]=w.useState(!1),qe=w.useRef(null),Xe=w.useRef(null),xt=w.useRef([]),Xt=w.useRef(null),qt=w.useMemo(()=>Le(v?.description),[v?.description,Le]),ut=w.useMemo(()=>({__html:qt}),[qt]);w.useEffect(()=>{Ee(!1)},[n]),w.useEffect(()=>{const re=Xe.current;if(!re)return;const Ie=()=>{Pe(re.scrollHeight>320)};Ie();const Je=new ResizeObserver(Ie);return Je.observe(re),()=>Je.disconnect()},[qt]);const Gt=w.useCallback(()=>{Ee(re=>{const Ie=!re;return!Ie&&qe.current&&qe.current.getBoundingClientRect().top<0&&qe.current.scrollIntoView({behavior:"smooth",block:"start"}),Ie})},[]);w.useEffect(()=>{!f&&nt.length>0&&m(nt[0])},[f,nt]),w.useEffect(()=>{if(nt.length<=1||I||Q)return;const re=setInterval(()=>{m(Ie=>{const vt=((Ie?nt.indexOf(Ie):0)+1)%nt.length;return nt[vt]})},4e3);return()=>clearInterval(re)},[nt,I,Q]),w.useEffect(()=>{if(!f||nt.length<=1)return;const re=nt.indexOf(f),Ie=Xt.current,Je=xt.current[re];if(Ie&&Je){const vt=Ie.clientWidth,Dt=Je.offsetLeft,jt=Je.offsetWidth,bn=Dt-vt/2+jt/2;Ie.scrollTo({left:bn,behavior:"smooth"})}},[f,nt]);const $t=w.useCallback(re=>{m(re)},[]),Kt=w.useCallback(()=>{Z(!0)},[]),is=w.useCallback(()=>{Z(!1)},[]),Ft=w.useCallback(()=>{xe(!0)},[]),xn=w.useCallback(()=>{xe(!1)},[]),Rn=w.useCallback(()=>{m(re=>{const Je=((re?nt.indexOf(re):0)-1+nt.length)%nt.length;return nt[Je]})},[nt]),_s=w.useCallback(()=>{m(re=>{const Je=((re?nt.indexOf(re):0)+1)%nt.length;return nt[Je]})},[nt]);w.useEffect(()=>{if(!Q)return;const re=Ie=>{Ie.key==="Escape"?xe(!1):Ie.key==="ArrowLeft"?Rn():Ie.key==="ArrowRight"&&_s()};return window.addEventListener("keydown",re),()=>window.removeEventListener("keydown",re)},[Q,Rn,_s]);const os=w.useCallback(async re=>{if(re.preventDefault(),!!v?.id){if(!$.trim()){Be.error("Vui lòng nhập nội dung đánh giá!");return}E(!0);try{await CT.createReview({productId:v.id,userId:s?.id,authorName:s?.displayName||H.trim()||void 0,authorEmail:s?.email||te.trim()||void 0,content:$.trim(),rating:U}),Be.success(e("productDetail.reviewSuccess")),M(""),$e(),_()}catch(Ie){console.error("Failed to submit review:",Ie)}finally{E(!1)}}},[v?.id,$,U,H,te,s,e,$e,_]),Vn=w.useMemo(()=>{const re=Ge.length,Ie={5:0,4:0,3:0,2:0,1:0};let Je=0;Ge.forEach(Dt=>{const jt=Math.min(5,Math.max(1,Math.round(Dt.rating||5)));Ie[jt]=(Ie[jt]||0)+1,Je+=Dt.rating||5});const vt=re>0?(Je/re).toFixed(1):v?.ratingAverage&&v.ratingAverage>0?v.ratingAverage.toFixed(1):"5.0";return{total:re,distribution:Ie,avg:vt}},[Ge,v?.ratingAverage]),La=w.useMemo(()=>C?Ge.filter(re=>Math.round(re.rating)===C):Ge,[Ge,C]),[rr,nn]=Ew({align:"start",loop:!1,dragFree:!0},[Nw({delay:3e3,stopOnInteraction:!1,stopOnMouseEnter:!0})]),ls=w.useCallback(()=>{nn&&nn.scrollPrev()},[nn]),Vs=w.useCallback(()=>{nn&&nn.scrollNext()},[nn]);return N?a.jsxs("div",{className:"w-full max-w-7xl mx-auto py-12 flex flex-col items-center justify-center space-y-4",children:[a.jsx(nr,{className:"w-8 h-8 text-primary animate-spin"}),a.jsx("p",{className:"text-sm font-medium text-text-muted",children:e("productDetail.loading")})]}):k||!v?a.jsxs("div",{className:"w-full max-w-md mx-auto py-16 text-center space-y-4 bg-card/60 border border-border/60 rounded-3xl p-8 backdrop-blur-xl",children:[a.jsx("div",{className:"w-16 h-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto",children:a.jsx(Un,{className:"w-8 h-8"})}),a.jsx("h3",{className:"text-xl font-bold text-text",children:k||e("productDetail.notFound")}),a.jsxs(Ue,{onClick:Re,className:"px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity inline-flex items-center gap-2",children:[a.jsx(id,{className:"w-4 h-4"}),a.jsx("span",{children:e("productDetail.backToStore")})]})]}):a.jsxs("div",{className:"w-full space-y-6 pb-12 animate-in fade-in duration-300",children:[a.jsx("div",{className:"flex items-center justify-between",children:a.jsxs("button",{type:"button",onClick:Re,className:"inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-surface-2 text-text-muted hover:text-text text-xs font-bold transition-all shadow-xs cursor-pointer",children:[a.jsx(id,{className:"w-4 h-4 text-primary"}),a.jsx("span",{children:e("productDetail.backToStore")})]})}),a.jsxs("div",{className:"space-y-2",children:[a.jsx("h1",{className:"text-2xl sm:text-3xl lg:text-4xl font-black text-text tracking-tight leading-snug",children:v.title}),a.jsxs("div",{className:"flex items-center gap-3 text-xs sm:text-sm text-text-muted font-medium",children:[a.jsxs("div",{className:"flex items-center gap-1 text-primary",children:[Array.from({length:5}).map((re,Ie)=>a.jsx(Mo,{className:"w-4 h-4 fill-primary text-primary"},Ie)),a.jsx("span",{className:"font-bold text-text ml-1",children:Vn.avg})]}),a.jsx("span",{children:"•"}),a.jsx("span",{children:e("productDetail.sold",{count:v.totalSales||416})})]})]}),a.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8",children:[a.jsxs("div",{className:"lg:col-span-8 space-y-6",children:[a.jsxs("div",{onClick:Ft,onMouseEnter:Kt,onMouseLeave:is,className:"relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-card shadow-xl group cursor-pointer",children:[a.jsx(fi,{src:f||v.thumbnail?.url,alt:v.title,fallbackTitle:v.title,className:"w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 animate-fadeIn"},f||v.thumbnail?.url),nt.length>1&&a.jsxs(a.Fragment,{children:[a.jsx("button",{type:"button",onClick:re=>{re.stopPropagation(),Rn()},"aria-label":"Previous image",className:"absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white border border-white/20 hover:bg-[#F59E0B] hover:text-black hover:border-[#F59E0B] opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl cursor-pointer",children:a.jsx(rc,{className:"w-5 h-5"})}),a.jsx("button",{type:"button",onClick:re=>{re.stopPropagation(),_s()},"aria-label":"Next image",className:"absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white border border-white/20 hover:bg-[#F59E0B] hover:text-black hover:border-[#F59E0B] opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl cursor-pointer",children:a.jsx(Ca,{className:"w-5 h-5"})})]}),a.jsxs("button",{type:"button",onClick:re=>{re.stopPropagation(),Ft()},"aria-label":"Expand image",className:"absolute bottom-4 left-4 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md text-white border border-white/20 hover:bg-[#F59E0B] hover:text-black hover:border-[#F59E0B] transition-all duration-200 shadow-md flex items-center gap-2 text-xs font-bold cursor-pointer",children:[a.jsx(EB,{className:"w-4 h-4"}),a.jsx("span",{children:e("productDetail.zoomImage")})]})]}),nt.length>0&&a.jsx("div",{ref:Xt,onMouseEnter:Kt,onMouseLeave:is,className:"flex items-center gap-3 overflow-x-auto no-scrollbar px-3 py-2.5",children:nt.map((re,Ie)=>{const Je=f===re;return a.jsxs("button",{type:"button",ref:vt=>{xt.current[Ie]=vt},onClick:()=>$t(re),className:`relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 cursor-pointer ${Je?"border-primary shadow-lg shadow-primary/25 scale-105 ring-2 ring-primary/30 opacity-100":"border-border opacity-60 hover:opacity-100 hover:border-primary/50 hover:scale-100"}`,children:[a.jsx("img",{src:re,alt:`Gallery ${Ie}`,className:"w-full h-full object-contain"}),Je&&a.jsx("div",{className:"absolute inset-x-0 bottom-0 h-1 bg-primary animate-pulse"})]},Ie)})}),v.highlights&&v.highlights.length>0&&a.jsxs("div",{className:"rounded-2xl overflow-hidden border border-border/80 shadow-lg",children:[a.jsxs("div",{className:"px-4 py-3 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-primary/20 flex items-center gap-2.5",children:[a.jsx("div",{className:"p-1.5 rounded-lg bg-primary/15 border border-primary/30",children:a.jsx(js,{className:"w-4 h-4 text-primary shrink-0"})}),a.jsx("h3",{className:"text-sm font-extrabold text-text tracking-wide",children:e("productDetail.packageInfo")}),a.jsxs("span",{className:"ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 uppercase tracking-wider",children:["✓ ",e("productDetail.guaranteed")]})]}),a.jsx("div",{className:"p-4 bg-card grid grid-cols-1 sm:grid-cols-2 gap-2",children:v.highlights.map((re,Ie)=>a.jsxs("div",{className:"flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface border border-border/60 hover:border-primary/30 hover:bg-surface-2 transition-all duration-200 group",children:[a.jsx("div",{className:"w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors",children:a.jsx(pn,{className:"w-3 h-3 text-primary stroke-[3]"})}),a.jsx("span",{className:"text-xs font-semibold text-text leading-tight",children:re})]},`highlight-feature-${Ie}`))})]}),v.description&&a.jsxs("div",{ref:qe,className:"rounded-2xl overflow-hidden border border-border/80 shadow-lg",children:[a.jsx("div",{className:"px-4 py-3 bg-gradient-to-r from-surface via-surface to-transparent border-b border-border/60 flex items-center gap-2.5",children:a.jsx("span",{className:"text-sm font-extrabold text-text tracking-wide",children:e("productDetail.description")})}),a.jsxs("div",{className:"relative bg-card",children:[a.jsx("div",{className:"overflow-hidden transition-all duration-500 ease-in-out",style:{maxHeight:ke?"9999px":"320px"},children:a.jsx("div",{ref:Xe,className:`px-4 pb-4 pt-3 text-xs sm:text-sm leading-relaxed text-text-muted
                      [&_p]:mb-3.5 sm:[&_p]:mb-4 [&_p]:leading-relaxed
                      [&_h1]:text-lg sm:[&_h1]:text-xl [&_h1]:font-black [&_h1]:text-text [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:tracking-tight
                      [&_h2]:text-base sm:[&_h2]:text-lg [&_h2]:font-black [&_h2]:text-text [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:tracking-tight
                      [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-bold [&_h3]:text-text [&_h3]:mt-4 [&_h3]:mb-2
                      [&_h4]:text-xs sm:[&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-text [&_h4]:mt-3 [&_h4]:mb-2
                      [&_img]:my-5 sm:[&_img]:my-6 [&_img]:rounded-xl [&_img]:w-full [&_img]:max-w-full [&_img]:h-auto [&_img]:object-cover [&_img]:border [&_img]:border-border/60 [&_img]:shadow-lg [&_img]:block
                      [&_figure]:my-5 [&_figure]:w-full
                      [&_iframe]:my-5 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:border [&_iframe]:border-border/60
                      [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary/80 [&_a]:break-all
                      [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
                      [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5
                      [&_li]:mb-1
                      [&_strong]:font-extrabold [&_strong]:text-text
                      [&_blockquote]:border-l-4 [&_blockquote]:border-primary/60 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-text-muted`,dangerouslySetInnerHTML:ut})}),De&&!ke&&a.jsx("div",{className:"absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none"})]}),De&&a.jsxs("button",{type:"button",onClick:Gt,className:"w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-primary hover:text-primary-hover border-t border-border/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer bg-card",children:[a.jsx(ov,{className:`w-4 h-4 transition-transform duration-300 ${ke?"rotate-180":""}`}),a.jsx("span",{children:e(ke?"productDetail.collapseDescription":"productDetail.expandDescription")})]})]}),Zt&&a.jsxs("div",{className:"rounded-2xl overflow-hidden border border-border/80 shadow-lg",children:[a.jsxs("div",{className:"px-4 py-3 bg-gradient-to-r from-surface via-surface to-transparent border-b border-border/60 flex items-center gap-2.5",children:[a.jsx("div",{className:"p-1.5 rounded-lg bg-surface border border-border/80",children:a.jsx(SB,{className:"w-4 h-4 text-primary shrink-0"})}),a.jsx("span",{className:"text-sm font-extrabold text-text tracking-wide",children:e("productDetail.systemRequirements")})]}),a.jsx("div",{className:`p-4 bg-card overflow-x-auto text-xs text-text-muted leading-relaxed
                  [&_table]:w-full [&_table]:border-collapse [&_table]:min-w-[500px]
                  [&_thead_tr]:border-b [&_thead_tr]:border-border/60
                  [&_td]:py-2.5 [&_td]:px-3 [&_th]:py-2.5 [&_th]:px-3
                  [&_tbody_tr]:border-b [&_tbody_tr]:border-border/40 [&_tbody_tr]:hover:bg-surface/50
                  [&_strong]:text-text [&_strong]:font-bold [&_b]:text-text [&_b]:font-bold
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5
                  [&_p]:mb-2`,dangerouslySetInnerHTML:{__html:jT.sanitize(Zt,{ADD_TAGS:["table","thead","tbody","tr","th","td","div","span","p","b","strong","ul","ol","li","br"],ADD_ATTR:["colspan","rowspan","style","class"]})}})]})]}),a.jsx("div",{className:"lg:col-span-4 space-y-6",children:a.jsxs("div",{className:"p-6 rounded-2xl bg-card border border-border space-y-6 backdrop-blur-xl shadow-2xl sticky top-6",children:[a.jsxs("div",{className:"space-y-3",children:[a.jsx("div",{className:"aspect-video w-full rounded-xl overflow-hidden border border-border shadow-md bg-surface",children:a.jsx(fi,{src:v.thumbnail?.url,alt:v.title,fallbackTitle:v.title,className:"w-full h-full object-contain"})}),a.jsxs("div",{className:"p-3 rounded-xl bg-surface border border-border flex items-center gap-3",children:[a.jsx("img",{src:Ote,alt:"ESRB Everyone",className:"h-10 w-auto shrink-0 object-contain rounded-sm"}),a.jsxs("div",{className:"text-[11px] text-text-muted",children:[a.jsx("div",{className:"font-bold text-text",children:e("productDetail.esrb.rating")}),a.jsx("div",{children:e("productDetail.esrb.description")})]})]})]}),(v.tags&&v.tags.length>0||v.categories&&v.categories.length>0)&&a.jsxs("div",{className:"space-y-2",children:[a.jsxs("span",{className:"text-xs font-bold text-text-muted block",children:[e("productDetail.genres"),":"]}),a.jsx("div",{className:"flex flex-wrap gap-2",children:v.tags&&v.tags.length>0?v.tags.map(re=>a.jsx("button",{type:"button",onClick:()=>t(`/store/all?tagIds=${re.id}`),className:"px-3.5 py-1.5 rounded-full bg-surface/80 border border-border/80 hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-text text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs",children:re.name},`tag-${re.id}`)):v.categories?.map(re=>a.jsx("button",{type:"button",onClick:()=>t(`/store/all?categoryIds=${re.id}`),className:"px-3.5 py-1.5 rounded-full bg-surface/80 border border-border/80 hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-text text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs",children:re.name},`cat-${re.id}`))})]}),a.jsxs("div",{className:"flex items-center justify-between text-xs pt-2 border-t border-border",children:[a.jsxs("span",{className:"font-bold text-text-muted",children:[e("productDetail.status"),":"]}),a.jsx("span",{className:`px-3 py-1 rounded-full text-xs font-bold ${Rt===lm.OUT_OF_STOCK?"bg-red-500/15 text-red-500 border border-red-500/30":"bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"}`,children:Rt===lm.OUT_OF_STOCK?e("productDetail.outOfStock"):e("productDetail.inStock")})]}),a.jsx("div",{className:"pt-2 flex items-baseline gap-3 flex-wrap",children:Qe===0?a.jsx("span",{className:"text-2xl font-black text-primary",children:e("store.contactZalo")}):a.jsxs(a.Fragment,{children:[a.jsxs("span",{className:"text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,100,50,0.35)] tracking-tight",children:[Qe.toLocaleString("vi-VN")," ₫"]}),mt!==null&&a.jsxs("span",{className:"text-sm text-text-muted line-through font-medium",children:[mt.toLocaleString("vi-VN")," ₫"]}),ot&&zt>0&&a.jsxs("span",{className:"px-2.5 py-1 rounded-lg text-xs font-black bg-red-600 text-white shadow-xs border border-red-500/30",children:["-",zt,"%"]})]})}),Qe>0&&a.jsxs("div",{className:"space-y-3 pt-4 border-t border-border",children:[a.jsxs("div",{className:"flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/15 via-secondary/10 to-transparent border border-primary/30",children:[a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx(fn,{className:"w-4 h-4 text-primary animate-pulse shrink-0"}),a.jsx("span",{className:"text-xs font-black text-primary tracking-wider uppercase",children:e("productDetail.selectEdition")})]}),a.jsxs("span",{className:"px-2 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] text-white shadow-[0_0_10px_rgba(255,27,112,0.45)] uppercase tracking-wider flex items-center gap-1",children:[a.jsx(cv,{className:"w-3 h-3 fill-white shrink-0"}),"HOT"]})]}),a.jsxs("div",{className:"space-y-3",children:[G.length===0&&a.jsx("div",{onClick:()=>Ke(null),className:"glowing-border-card rounded-xl transition-all duration-300 cursor-pointer shadow-md",children:a.jsxs("div",{className:"relative w-full h-full bg-card rounded-[11px] p-3.5 flex items-center justify-between text-xs font-bold text-left z-10 border border-primary/30",children:[a.jsxs("div",{className:"flex flex-col gap-1 pr-2",children:[a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("span",{className:"font-extrabold text-xs text-text",children:"STANDARD EDITION"}),a.jsx("span",{className:"px-1.5 py-0.5 text-[9px] font-black rounded bg-primary/20 text-primary border border-primary/40 uppercase",children:e("productDetail.standardEdition")})]}),a.jsxs("span",{className:"text-xs font-black bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent",children:[Qe.toLocaleString("vi-VN")," ₫"]})]}),a.jsx("div",{className:"w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] text-white flex items-center justify-center shadow-[0_0_10px_rgba(255,27,112,0.45)] shrink-0",children:a.jsx(pn,{className:"w-3.5 h-3.5 stroke-[3]"})})]})}),G.map(re=>{const Ie=p===re.id,Je=y===re.id,vt=typeof re.regularPrice=="string"?parseFloat(re.regularPrice):re.regularPrice??0,Dt=re.salePrice!==null&&re.salePrice!==void 0&&re.salePrice!==""?typeof re.salePrice=="string"?parseFloat(re.salePrice):re.salePrice:null,jt=Dt!==null&&Dt>0&&vt>Dt,bn=jt?Dt:vt,En=re.title||"DELUXE EDITION",ua=/deluxe|premium|ultimate|vip/i.test(En);return a.jsxs("div",{onClick:()=>Ke(re.id),onMouseEnter:()=>S(re.id),onMouseLeave:()=>S(null),className:`relative group rounded-xl transition-all duration-300 cursor-pointer ${Ie?"glowing-border-card shadow-lg":""}`,children:[a.jsxs("div",{className:`relative w-full h-full rounded-[11px] p-3.5 flex items-center justify-between text-xs font-bold text-left transition-all z-10 border ${Ie?"bg-card text-text border-primary/40 shadow-glow-primary/20":Je?"bg-surface-2 text-text border-primary/30 shadow-md":"bg-surface/90 text-text-muted hover:text-text border-border/80 hover:border-primary/20"}`,children:[a.jsxs("div",{className:"flex flex-col gap-1 pr-2 min-w-0",children:[a.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[a.jsx("span",{className:"font-extrabold text-xs text-text",children:En.replace(/🔥/g,"").trim()}),ua&&a.jsxs("span",{className:"px-1.5 py-0.5 text-[9px] font-black rounded bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] text-white shadow-xs flex items-center gap-0.5 uppercase tracking-wider shrink-0",children:[a.jsx(kB,{className:"w-2.5 h-2.5 fill-white"}),"BEST VALUE"]})]}),a.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[a.jsxs("span",{className:`text-xs font-black ${Ie?"bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent":"text-text-muted"}`,children:[bn.toLocaleString("vi-VN")," ₫"]}),jt&&a.jsxs("span",{className:"text-[10px] text-text-muted line-through font-medium",children:[vt.toLocaleString("vi-VN")," ₫"]})]})]}),Ie?a.jsx("div",{className:"w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] text-white flex items-center justify-center shadow-[0_0_10px_rgba(255,27,112,0.45)] shrink-0",children:a.jsx(pn,{className:"w-3.5 h-3.5 stroke-[3]"})}):a.jsx("div",{className:`w-6 h-6 rounded-full border-2 shrink-0 transition-colors ${Je?"border-primary/60 bg-primary/10":"border-border/80"}`})]}),re.description&&a.jsx("div",{className:et("absolute z-50 pointer-events-none transition-all duration-200 ease-out","xl:right-[calc(100%+14px)] xl:top-1/2 xl:-translate-y-1/2 xl:w-72","max-xl:bottom-[calc(100%+10px)] max-xl:left-0 max-xl:w-full",Je?"opacity-100 scale-100 translate-y-0":"opacity-0 scale-95 pointer-events-none translate-y-1"),children:a.jsxs("div",{className:"relative p-3.5 rounded-xl bg-card/98 backdrop-blur-md border border-primary/40 text-xs text-text shadow-2xl shadow-primary/10 ring-1 ring-primary/20",children:[a.jsx("div",{className:"hidden xl:block absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-card border-t border-r border-primary/40 rotate-45"}),a.jsx("div",{className:"block xl:hidden absolute -bottom-1.5 left-6 w-3 h-3 bg-card border-b border-r border-primary/40 rotate-45"}),a.jsxs("div",{className:"flex flex-col gap-1.5 relative z-10",children:[a.jsxs("div",{className:"flex items-center gap-1.5 pb-1 border-b border-border/60",children:[a.jsx(fn,{className:"w-3.5 h-3.5 text-primary animate-pulse shrink-0"}),a.jsxs("span",{className:"font-extrabold text-[11px] text-primary tracking-wide uppercase",children:[e("productDetail.editionDescription"),":"]}),a.jsx("span",{className:"font-bold text-xs text-text truncate",children:En.replace(/🔥/g,"").trim()})]}),a.jsx("div",{className:"leading-relaxed text-[11px] font-medium text-text-muted whitespace-pre-line [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_a]:text-primary [&_a]:underline",dangerouslySetInnerHTML:{__html:Le(re.description)}})]})]})})]},re.id)})]})]}),a.jsx("div",{className:"space-y-3 pt-4 border-t border-border",children:Qe===0?a.jsxs("a",{href:Is.ZALO_URL,target:"_blank",rel:"noopener noreferrer",onClick:re=>{re.preventDefault(),dc(Is.ZALO_URL)},className:"w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer",children:[a.jsx(tl,{className:"w-4 h-4"}),a.jsx("span",{children:e("store.contactZalo")})]}):a.jsxs(a.Fragment,{children:[a.jsxs("button",{type:"button",onClick:ve,className:"w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,27,112,0.45),0_0_12px_rgba(255,184,0,0.3)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer",children:[a.jsx(tl,{className:"w-4 h-4"}),a.jsx("span",{children:e("productDetail.buyNow")})]}),a.jsxs("div",{className:"grid grid-cols-2 gap-2.5",children:[a.jsxs("button",{type:"button",onClick:Ve,disabled:P,className:"py-3 px-3 rounded-2xl bg-surface border border-border hover:bg-surface-2 text-text font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50",children:[P?a.jsx(gn,{className:"w-4 h-4 text-primary shrink-0 animate-spin"}):a.jsx(no,{className:"w-4 h-4 text-primary shrink-0"}),a.jsx("span",{className:"truncate",children:e("productDetail.addToCart")})]}),a.jsxs("button",{type:"button",onClick:le,disabled:q,className:`py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${F?"bg-rose-500/10 border-rose-500/40 text-rose-500 shadow-xs":"bg-surface border-border hover:bg-surface-2 text-text hover:text-rose-500"}`,children:[q?a.jsx(gn,{className:"w-4 h-4 text-rose-500 shrink-0 animate-spin"}):a.jsx(ld,{className:`w-4 h-4 shrink-0 transition-colors ${F?"fill-rose-500 text-rose-500":"text-rose-500"}`}),a.jsx("span",{className:"truncate",children:e("productDetail.addToWishlist")})]})]})]})})]})})]}),a.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-xl backdrop-blur-xl",children:[a.jsx("div",{className:"flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border",children:a.jsxs("div",{className:"space-y-1",children:[a.jsxs("h3",{className:"text-xl font-black text-text flex items-center gap-2",children:[a.jsx(Py,{className:"w-6 h-6 text-primary"}),a.jsx("span",{children:e("productDetail.reviewsTitle")})]}),a.jsx("p",{className:"text-xs text-text-muted font-medium",children:e("productDetail.reviewsSubtitle",{count:Vn.total})})]})}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-surface/60 border border-border/80",children:[a.jsxs("div",{className:"md:col-span-4 text-center md:border-r md:border-border/60 pr-0 md:pr-6",children:[a.jsx("div",{className:"text-5xl font-black text-primary tracking-tight",children:Vn.avg}),a.jsx("div",{className:"flex items-center justify-center gap-1 my-2 text-amber-400",children:Array.from({length:5}).map((re,Ie)=>a.jsx(Mo,{className:`w-5 h-5 ${Ie<Math.round(Number(Vn.avg))?"fill-amber-400 text-amber-400":"text-text-muted/40"}`},Ie))}),a.jsx("p",{className:"text-xs font-semibold text-text-muted",children:e("productDetail.ratingBasedOn",{count:Vn.total})})]}),a.jsx("div",{className:"md:col-span-8 space-y-2",children:[5,4,3,2,1].map(re=>{const Ie=Vn.distribution[re]||0,Je=Vn.total>0?Ie/Vn.total*100:0;return a.jsxs("div",{className:"flex items-center gap-3 text-xs",children:[a.jsxs("div",{className:"flex items-center gap-1 w-12 shrink-0 font-bold text-text-muted",children:[a.jsx("span",{children:re}),a.jsx(Mo,{className:"w-3.5 h-3.5 fill-amber-400 text-amber-400"})]}),a.jsx("div",{className:"flex-1 h-2 rounded-full bg-border/60 overflow-hidden",children:a.jsx("div",{className:"h-full bg-primary rounded-full transition-all duration-500",style:{width:`${Je}%`}})}),a.jsx("span",{className:"w-8 text-right font-medium text-text-muted/80",children:Ie})]},re)})})]}),a.jsxs("div",{className:"flex items-center gap-2 overflow-x-auto no-scrollbar py-1",children:[a.jsxs("button",{type:"button",onClick:()=>A(null),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${C===null?"bg-primary text-black shadow-md shadow-primary/20":"bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-2"}`,children:[e("productDetail.ratingFilterAll")," (",Vn.total,")"]}),[5,4,3,2,1].map(re=>a.jsxs("button",{type:"button",onClick:()=>A(re),className:`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${C===re?"bg-primary text-black shadow-md shadow-primary/20":"bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-2"}`,children:[a.jsx("span",{children:re}),a.jsx(Mo,{className:"w-3.5 h-3.5 fill-current"}),a.jsxs("span",{children:["(",Vn.distribution[re]||0,")"]})]},re))]}),a.jsxs("form",{onSubmit:os,className:"p-6 rounded-2xl bg-surface border border-border space-y-4",children:[a.jsxs("h4",{className:"text-sm font-extrabold text-text uppercase tracking-wider flex items-center gap-2",children:[a.jsx(fn,{className:"w-4 h-4 text-primary"}),a.jsx("span",{children:e("productDetail.writeReviewTitle")})]}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("span",{className:"text-xs font-bold text-text-muted",children:e("productDetail.yourRating")}),a.jsx("div",{className:"flex items-center gap-1",children:[1,2,3,4,5].map(re=>{const Ie=re<=(R||U);return a.jsx("button",{type:"button",onMouseEnter:()=>L(re),onMouseLeave:()=>L(0),onClick:()=>B(re),className:"p-1 transition-transform hover:scale-125 cursor-pointer",children:a.jsx(Mo,{className:`w-6 h-6 transition-colors ${Ie?"fill-amber-400 text-amber-400":"text-text-muted/40 hover:text-amber-400/60"}`})},re)})})]}),!s&&a.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[a.jsxs("div",{children:[a.jsx("label",{className:"block text-xs font-semibold text-text mb-1",children:e("productDetail.authorNameLabel")}),a.jsx("input",{type:"text",value:H,onChange:re=>ae(re.target.value),placeholder:e("productDetail.reviewNamePlaceholder"),className:"w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary"})]}),a.jsxs("div",{children:[a.jsx("label",{className:"block text-xs font-semibold text-text mb-1",children:e("productDetail.authorEmailLabel")}),a.jsx("input",{type:"email",value:te,onChange:re=>K(re.target.value),placeholder:e("productDetail.reviewEmailPlaceholder"),className:"w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary"})]})]}),a.jsx("div",{children:a.jsx("textarea",{rows:3,value:$,onChange:re=>M(re.target.value),placeholder:e("productDetail.contentPlaceholder"),className:"w-full bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl p-3.5 text-xs text-text placeholder:text-text-muted outline-none transition-all resize-none"})}),a.jsx("div",{className:"flex justify-end",children:a.jsx(Ue,{type:"submit",disabled:V,className:"px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50",children:V?a.jsxs(a.Fragment,{children:[a.jsx(gn,{className:"w-4 h-4 animate-spin"}),a.jsx("span",{children:e("productDetail.submittingReview")})]}):a.jsxs(a.Fragment,{children:[a.jsx("span",{children:e("productDetail.submitReview")}),a.jsx(wC,{className:"w-4 h-4"})]})})})]}),je?a.jsxs("div",{className:"py-8 text-center text-xs text-text-muted flex items-center justify-center gap-2",children:[a.jsx(gn,{className:"w-4 h-4 animate-spin text-primary"}),a.jsx("span",{children:e("productDetail.loadingReviews")})]}):La.length===0?a.jsxs("div",{className:"py-12 text-center space-y-2 bg-surface/40 rounded-2xl border border-dashed border-border/80 p-6",children:[a.jsx(Py,{className:"w-10 h-10 text-text-muted/40 mx-auto"}),a.jsx("h5",{className:"font-bold text-sm text-text",children:e("productDetail.noReviews")}),a.jsx("p",{className:"text-xs text-text-muted max-w-sm mx-auto",children:e("productDetail.noReviewsDesc")})]}):a.jsx("div",{className:"space-y-4",children:La.map(re=>{const Ie=re.user?.displayName||re.authorName||"Gamer",Je=Ie.charAt(0).toUpperCase();return a.jsxs("div",{className:"p-5 rounded-2xl bg-surface/80 border border-border space-y-3 transition-all hover:border-primary/40 shadow-xs",children:[a.jsxs("div",{className:"flex items-center justify-between flex-wrap gap-2",children:[a.jsxs("div",{className:"flex items-center gap-3",children:[a.jsx("div",{className:"w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-amber-500/20 border border-primary/30 text-primary font-black text-sm flex items-center justify-center shrink-0",children:Je}),a.jsxs("div",{children:[a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("span",{className:"font-extrabold text-xs text-text",children:Ie}),a.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full",children:[a.jsx(pn,{className:"w-3 h-3"})," ",e("productDetail.verifiedPurchase")]})]}),a.jsx("div",{className:"text-[11px] text-text-muted font-medium mt-0.5",children:re.createdAt?mi(re.createdAt).format("DD/MM/YYYY HH:mm"):e("productDetail.justNow")})]})]}),a.jsx("div",{className:"flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-bold",children:Array.from({length:5}).map((vt,Dt)=>a.jsx(Mo,{className:`w-3.5 h-3.5 ${Dt<Math.round(re.rating)?"fill-amber-400 text-amber-400":"text-text-muted/30"}`},Dt))})]}),a.jsx("p",{className:"text-xs sm:text-sm text-text/90 leading-relaxed font-normal pl-1",children:re.content})]},re.id)})})]}),ge.length>0&&a.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-xl backdrop-blur-xl",children:[a.jsxs("div",{className:"flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border",children:[a.jsxs("div",{className:"space-y-1",children:[a.jsxs("h3",{className:"text-xl font-black text-text flex items-center gap-2",children:[a.jsx(Un,{className:"w-6 h-6 text-primary"}),a.jsx("span",{children:e("productDetail.relatedProductsTitle")})]}),a.jsx("p",{className:"text-xs text-text-muted font-medium",children:e("productDetail.relatedProductsSubtitle")})]}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("button",{type:"button",onClick:ls,"aria-label":"Previous related games",className:"p-2.5 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-text-muted transition-all cursor-pointer shadow-xs",children:a.jsx(rc,{className:"w-5 h-5"})}),a.jsx("button",{type:"button",onClick:Vs,"aria-label":"Next related games",className:"p-2.5 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-text-muted transition-all cursor-pointer shadow-xs",children:a.jsx(Ca,{className:"w-5 h-5"})})]})]}),a.jsx("div",{ref:rr,className:"overflow-hidden py-2 cursor-grab active:cursor-grabbing",children:a.jsx("div",{className:"flex items-stretch gap-4 sm:gap-6 touch-pan-y",children:ge.map(re=>a.jsx("div",{className:"flex-[0_0_auto] min-w-0",children:a.jsx(kp,{product:re,className:"w-64 sm:w-72",onClick:Ie=>{t(`/store/${Ie.slug||Ie.id}`),window.scrollTo({top:0,behavior:"smooth"})}})},re.id))})})]}),Q&&aE.createPortal(a.jsxs("div",{onClick:xn,className:"fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn cursor-pointer",children:[a.jsxs("div",{onClick:re=>re.stopPropagation(),className:"w-full max-w-7xl flex items-center justify-between z-20 cursor-default",children:[a.jsxs("div",{className:"text-white/90 text-sm font-bold truncate max-w-md sm:max-w-xl",children:[v.title," ",nt.length>0&&a.jsxs("span",{className:"text-xs font-normal text-white/50 ml-2",children:["(",(f?nt.indexOf(f):0)+1," / ",nt.length,")"]})]}),a.jsx("button",{type:"button",onClick:re=>{re.stopPropagation(),xn()},"aria-label":"Close fullscreen view",className:"p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-110 shadow-lg cursor-pointer z-30",children:a.jsx(Yt,{className:"w-6 h-6"})})]}),a.jsxs("div",{onClick:re=>re.stopPropagation(),className:"relative flex-1 w-full max-w-6xl flex items-center justify-center my-4 overflow-hidden cursor-default",children:[nt.length>1&&a.jsx("button",{type:"button",onClick:re=>{re.stopPropagation(),Rn()},"aria-label":"Previous image",className:"absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 text-white border border-white/20 hover:bg-[#F59E0B] hover:text-black hover:border-[#F59E0B] transition-all hover:scale-110 shadow-xl cursor-pointer",children:a.jsx(rc,{className:"w-6 h-6"})}),a.jsx("img",{src:f||v.thumbnail?.url,alt:v.title,className:"max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"}),nt.length>1&&a.jsx("button",{type:"button",onClick:re=>{re.stopPropagation(),_s()},"aria-label":"Next image",className:"absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 text-white border border-white/20 hover:bg-[#F59E0B] hover:text-black hover:border-[#F59E0B] transition-all hover:scale-110 shadow-xl cursor-pointer",children:a.jsx(Ca,{className:"w-6 h-6"})})]}),nt.length>1&&a.jsx("div",{onClick:re=>re.stopPropagation(),className:"w-full max-w-4xl flex items-center justify-center gap-3 overflow-x-auto no-scrollbar px-3 py-2.5 z-20 cursor-default",children:nt.map((re,Ie)=>{const Je=f===re;return a.jsx("button",{type:"button",onClick:vt=>{vt.stopPropagation(),m(re)},className:`relative w-20 sm:w-28 aspect-video rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${Je?"border-[#F59E0B] scale-105 opacity-100 ring-2 ring-[#F59E0B]/50 shadow-lg shadow-[#F59E0B]/30":"border-white/20 opacity-40 hover:opacity-100"}`,children:a.jsx("img",{src:re,alt:`Lightbox thumb ${Ie}`,className:"w-full h-full object-contain"})},Ie)})})]}),document.body),a.jsx(pA,{isOpen:X,onClose:be,product:v,selectedVariation:se,totalPrice:Qe,onOpenTopup:Ae}),a.jsx(wv,{isOpen:ue,onClose:Te})]})},Dte=Sw({displayName:Zi().min(1,"displayNameRequired").max(zr,"displayNameMaxLength").transform(e=>e.trim()),email:Zi().min(1,"emailRequired").max(zr,"emailMaxLength").email("emailInvalid").transform(e=>e.trim().toLowerCase()),phone:Zi().min(1,"phoneRequired").max(20,"phoneMaxLength").regex(/^[0-9+()\s-]{8,20}$/,"phoneInvalid").transform(e=>e.trim()),password:Zi().min(6,"passwordMinLength").max(zr,"passwordMaxLength"),confirmPassword:Zi().min(1,"confirmPasswordRequired")}).refine(e=>e.password===e.confirmPassword,{message:"passwordMismatch",path:["confirmPassword"]}),Mte=()=>{const{t:e}=Pt(),t=ss(),[n,s]=w.useState("register"),[i,l]=w.useState(""),[c,d]=w.useState(!1),[f,m]=w.useState(!1),[p,g]=w.useState(!1),[y,S]=w.useState(!1),[v,N]=w.useState(60),[j,_]=w.useState(null),{register:k,handleSubmit:C,formState:{errors:A}}=uw({resolver:dw(Dte),mode:"onSubmit",reValidateMode:"onSubmit"});w.useEffect(()=>{if(n!=="verify"||v<=0)return;const H=setInterval(()=>{N(ae=>ae-1)},1e3);return()=>clearInterval(H)},[n,v]);const U=w.useCallback(async H=>{g(!0),_(null);try{await ad.register({displayName:H.displayName,email:H.email,phone:H.phone,password:H.password}),l(H.email),s("verify"),N(60)}catch(ae){console.error("Registration failed:",ae),_(e("auth.register.errorMessage"))}finally{g(!1)}},[e]),B=w.useCallback(async()=>{if(!(v>0||y)){S(!0);try{await ad.resendCode({email:i}),Be.success(e("auth.register.resendSuccess")),N(60)}catch(H){console.error("Resend link failed:",H)}finally{S(!1)}}},[v,y,i,e]),R=w.useCallback(()=>d(H=>!H),[]),L=w.useCallback(()=>m(H=>!H),[]),$=w.useCallback(()=>{t("/login")},[t]),M=w.useMemo(()=>[{icon:js,label:e("auth.security.genuine")},{icon:aa,label:e("auth.security.secure")},{icon:uv,label:e("auth.security.support")}],[e]);return a.jsxs("div",{className:"relative w-full max-w-[620px] mx-auto animate-in fade-in zoom-in-95 duration-500",children:[a.jsx("div",{className:"absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 rounded-[2.5rem] blur-2xl opacity-70 pointer-events-none"}),a.jsxs("div",{className:"relative bg-surface/90 dark:bg-surface/80 backdrop-blur-2xl border border-border/80 shadow-2xl shadow-black/20 dark:shadow-black/60 rounded-[2rem] p-7 sm:p-9 overflow-hidden",children:[a.jsx("div",{className:"absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent"}),n==="register"?a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:"flex flex-col items-center justify-center mb-6 text-center",children:[a.jsxs("div",{className:"relative mb-3.5 flex items-center justify-center",children:[a.jsx("div",{className:"absolute w-16 h-16 bg-primary/20 rounded-full blur-xl pointer-events-none"}),a.jsx("img",{src:"/images/logo.png",alt:"Deluxe Gaming",className:"relative h-11 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"})]}),a.jsxs("div",{className:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-2",children:[a.jsx(fn,{className:"w-3.5 h-3.5"}),a.jsx("span",{children:e("auth.register.badge")})]}),a.jsx("h1",{className:"text-2xl sm:text-3xl font-black text-text tracking-tight mb-1.5",children:e("auth.register.title")}),a.jsx("p",{className:"text-xs sm:text-sm text-text-muted font-medium max-w-sm",children:e("auth.register.subtitle")})]}),j&&a.jsxs("div",{className:"mb-4 flex items-center gap-3 p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300",children:[a.jsx(cc,{className:"w-4 h-4 shrink-0"}),a.jsx("span",{children:j})]}),a.jsxs("form",{onSubmit:C(U),className:"space-y-4",noValidate:!0,children:[a.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4",children:[a.jsxs("div",{className:"space-y-1.5 sm:col-span-2",children:[a.jsx("label",{className:"text-xs font-bold uppercase tracking-wider text-text-muted",children:e("auth.register.displayNameLabel")}),a.jsxs("div",{className:"relative group",children:[a.jsx("div",{className:"absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors",children:a.jsx(ui,{className:"w-4 h-4"})}),a.jsx("input",{type:"text",...k("displayName"),placeholder:e("auth.register.displayNamePlaceholder"),className:"w-full bg-surface-2/40 hover:bg-surface-2/70 focus:bg-surface-2 border border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-text placeholder:text-text-muted/60 outline-none transition-all duration-200"})]}),A.displayName&&a.jsxs("p",{className:"flex items-center gap-1.5 text-xs text-destructive font-medium mt-1 animate-in fade-in",children:[a.jsx("span",{children:"•"}),a.jsx("span",{children:e(`auth.register.validation.${A.displayName.message}`,{max:zr})})]})]}),a.jsxs("div",{className:"space-y-1.5",children:[a.jsx("label",{className:"text-xs font-bold uppercase tracking-wider text-text-muted",children:e("auth.register.emailLabel")}),a.jsxs("div",{className:"relative group",children:[a.jsx("div",{className:"absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors",children:a.jsx(el,{className:"w-4 h-4"})}),a.jsx("input",{type:"email",...k("email"),placeholder:e("auth.register.emailPlaceholder"),className:"w-full bg-surface-2/40 hover:bg-surface-2/70 focus:bg-surface-2 border border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-text placeholder:text-text-muted/60 outline-none transition-all duration-200"})]}),A.email&&a.jsxs("p",{className:"flex items-center gap-1.5 text-xs text-destructive font-medium mt-1 animate-in fade-in",children:[a.jsx("span",{children:"•"}),a.jsx("span",{children:e(`auth.register.validation.${A.email.message}`,{max:zr})})]})]}),a.jsxs("div",{className:"space-y-1.5",children:[a.jsx("label",{className:"text-xs font-bold uppercase tracking-wider text-text-muted",children:e("auth.register.phoneLabel")}),a.jsxs("div",{className:"relative group",children:[a.jsx("div",{className:"absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors",children:a.jsx(lp,{className:"w-4 h-4"})}),a.jsx("input",{type:"tel",...k("phone"),placeholder:e("auth.register.phonePlaceholder"),className:"w-full bg-surface-2/40 hover:bg-surface-2/70 focus:bg-surface-2 border border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-text placeholder:text-text-muted/60 outline-none transition-all duration-200"})]}),A.phone&&a.jsxs("p",{className:"flex items-center gap-1.5 text-xs text-destructive font-medium mt-1 animate-in fade-in",children:[a.jsx("span",{children:"•"}),a.jsx("span",{children:e(`auth.register.validation.${A.phone.message}`,{max:20})})]})]}),a.jsxs("div",{className:"space-y-1.5",children:[a.jsx("label",{className:"text-xs font-bold uppercase tracking-wider text-text-muted",children:e("auth.register.passwordLabel")}),a.jsxs("div",{className:"relative group flex items-center",children:[a.jsx("div",{className:"absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors",children:a.jsx(aa,{className:"w-4 h-4"})}),a.jsx("input",{type:c?"text":"password",...k("password"),placeholder:e("auth.register.passwordPlaceholder"),className:"w-full bg-surface-2/40 hover:bg-surface-2/70 focus:bg-surface-2 border border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 pl-10 pr-11 py-2.5 rounded-xl text-sm font-medium text-text placeholder:text-text-muted/60 outline-none transition-all duration-200"}),a.jsx("button",{type:"button",onClick:R,className:"absolute right-3.5 text-text-muted hover:text-text transition-colors p-1",children:c?a.jsx(Ly,{className:"w-4 h-4"}):a.jsx(oi,{className:"w-4 h-4"})})]}),A.password&&a.jsxs("p",{className:"flex items-center gap-1.5 text-xs text-destructive font-medium mt-1 animate-in fade-in",children:[a.jsx("span",{children:"•"}),a.jsx("span",{children:e(`auth.register.validation.${A.password.message}`,{max:zr,min:6})})]})]}),a.jsxs("div",{className:"space-y-1.5",children:[a.jsx("label",{className:"text-xs font-bold uppercase tracking-wider text-text-muted",children:e("auth.register.confirmPasswordLabel")}),a.jsxs("div",{className:"relative group flex items-center",children:[a.jsx("div",{className:"absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors",children:a.jsx(aa,{className:"w-4 h-4"})}),a.jsx("input",{type:f?"text":"password",...k("confirmPassword"),placeholder:e("auth.register.confirmPasswordPlaceholder"),className:"w-full bg-surface-2/40 hover:bg-surface-2/70 focus:bg-surface-2 border border-border/80 focus:border-primary/80 focus:ring-2 focus:ring-primary/20 pl-10 pr-11 py-2.5 rounded-xl text-sm font-medium text-text placeholder:text-text-muted/60 outline-none transition-all duration-200"}),a.jsx("button",{type:"button",onClick:L,className:"absolute right-3.5 text-text-muted hover:text-text transition-colors p-1",children:f?a.jsx(Ly,{className:"w-4 h-4"}):a.jsx(oi,{className:"w-4 h-4"})})]}),A.confirmPassword&&a.jsxs("p",{className:"flex items-center gap-1.5 text-xs text-destructive font-medium mt-1 animate-in fade-in",children:[a.jsx("span",{children:"•"}),a.jsx("span",{children:e(`auth.register.validation.${A.confirmPassword.message}`)})]})]})]}),a.jsx(Ue,{type:"submit",disabled:p,className:"w-full h-11 sm:h-12 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] hover:brightness-110 active:scale-[0.99] text-white shadow-[0_0_20px_rgba(255,27,112,0.45),0_0_10px_rgba(255,184,0,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3",children:p?a.jsxs(a.Fragment,{children:[a.jsx(gn,{className:"w-4 h-4 animate-spin"}),a.jsx("span",{children:e("auth.register.registering")})]}):a.jsxs(a.Fragment,{children:[a.jsx("span",{children:e("auth.register.submitButton")}),a.jsx(Ur,{className:"w-4 h-4"})]})}),a.jsxs("div",{className:"text-center pt-4 border-t border-border/60",children:[a.jsx("p",{className:"text-xs text-text-muted font-medium mb-1.5",children:e("auth.register.alreadyHaveAccount")}),a.jsxs("button",{type:"button",onClick:$,className:"text-sm font-bold text-text hover:text-primary transition-colors inline-flex items-center gap-1.5 group mx-auto cursor-pointer",children:[e("auth.register.signIn"),a.jsx(Ur,{className:"w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"})]})]})]})]}):a.jsxs("div",{className:"text-center py-4",children:[a.jsxs("div",{className:"relative w-20 h-20 mx-auto flex items-center justify-center mb-6",children:[a.jsx("div",{className:"absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"}),a.jsx("div",{className:"relative w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center",children:a.jsx(bC,{className:"w-10 h-10 text-primary"})})]}),a.jsxs("div",{className:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-2",children:[a.jsx(fn,{className:"w-3.5 h-3.5"}),a.jsx("span",{children:e("auth.register.badge")})]}),a.jsx("h2",{className:"text-2xl sm:text-3xl font-black text-text tracking-tight mb-2",children:e("auth.register.verifyTitle")}),a.jsx("p",{className:"text-text-muted font-medium text-xs sm:text-sm max-w-sm mx-auto mb-2",children:e("auth.register.verifySubtitle")}),a.jsx("div",{className:"inline-block px-3 py-1.5 rounded-lg bg-surface-2 text-text font-bold text-sm border border-border mb-3 max-w-xs truncate",children:i}),a.jsx("p",{className:"text-text-muted font-normal text-xs max-w-sm mx-auto mb-7",children:e("auth.register.verifyInstruction")}),a.jsxs("div",{className:"space-y-3 max-w-xs mx-auto",children:[a.jsx(Ue,{type:"button",onClick:$,className:"w-full h-11 sm:h-12 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] hover:brightness-110 active:scale-[0.99] text-white shadow-[0_0_20px_rgba(255,27,112,0.45),0_0_10px_rgba(255,184,0,0.3)] transition-all flex items-center justify-center cursor-pointer",children:e("auth.register.backToLogin")}),a.jsx(Ue,{variant:"outline",type:"button",onClick:B,disabled:v>0||y,className:"w-full h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer",children:y?a.jsx(gn,{className:"w-3.5 h-3.5 animate-spin"}):v>0?a.jsx("span",{children:e("auth.register.resendWait",{time:v})}):a.jsxs(a.Fragment,{children:[a.jsx(L9,{className:"w-3.5 h-3.5"}),a.jsx("span",{children:e("auth.register.resendCode")})]})})]})]}),a.jsx("div",{className:"mt-6 pt-4 border-t border-border/40 grid grid-cols-3 gap-2 text-center",children:M.map((H,ae)=>{const te=H.icon;return a.jsxs("div",{className:"flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-text-muted",children:[a.jsx(te,{className:"w-3.5 h-3.5 text-primary shrink-0"}),a.jsx("span",{className:"truncate max-w-[100px] sm:max-w-none",children:H.label})]},ae)})})]})]})},Lte=()=>{const{t:e}=Pt(),t=w.useMemo(()=>[{id:"warranty",icon:js,title:e("sidebar.warranty"),path:"/warranty",color:"text-emerald-500",bgColor:"bg-emerald-500/10",borderColor:"border-emerald-500/20"},{id:"privacy",icon:aa,title:e("sidebar.privacy"),path:"/privacy",color:"text-indigo-500",bgColor:"bg-indigo-500/10",borderColor:"border-indigo-500/20"},{id:"terms",icon:XI,title:e("sidebar.terms"),path:"/terms",color:"text-amber-500",bgColor:"bg-amber-500/10",borderColor:"border-amber-500/20"}],[e]);return a.jsxs("div",{className:"w-full max-w-2xl mx-auto py-10 px-4",children:[a.jsxs("div",{className:"mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500",children:[a.jsx("div",{className:"w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4",children:a.jsx(SC,{className:"w-8 h-8"})}),a.jsx("h1",{className:"text-2xl sm:text-3xl font-black text-text tracking-tight mb-2",children:e("sidebar.settings")}),a.jsx("p",{className:"text-text-muted font-medium text-sm sm:text-base max-w-md mx-auto",children:e("app.subtitle",{defaultValue:"Quản lý cài đặt, chính sách và thông tin ứng dụng"})})]}),a.jsxs("div",{className:"space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both",children:[a.jsx("h2",{className:"text-sm font-bold text-text-muted uppercase tracking-wider mb-4 px-2",children:e("settings.infoAndPolicy")}),a.jsx("div",{className:"bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm",children:t.map((n,s)=>{const i=n.icon;return a.jsxs(H0,{to:n.path,className:`flex items-center gap-4 p-4 hover:bg-surface transition-colors cursor-pointer group ${s!==t.length-1?"border-b border-border/60":""}`,children:[a.jsx("div",{className:`w-12 h-12 rounded-xl ${n.bgColor} border ${n.borderColor} flex items-center justify-center shrink-0`,children:a.jsx(i,{className:`w-6 h-6 ${n.color}`})}),a.jsx("div",{className:"flex-1",children:a.jsx("h3",{className:"text-base font-bold text-text group-hover:text-primary transition-colors",children:n.title})}),a.jsx("div",{className:"w-8 h-8 rounded-full bg-surface group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors",children:a.jsx(Ca,{className:"w-4 h-4 text-text-muted group-hover:text-primary transition-colors"})})]},n.id)})})]})]})},X3={getCategories:async e=>{const{data:t}=await bt.get("/product-categories",{params:e});return t},getCategoryById:async e=>{const{data:t}=await bt.get(`/product-categories/${e}`);return t}},Pte={getTags:async e=>{const{data:t}=await bt.get("/product-tags",{params:e});return t},getTagById:async e=>{const{data:t}=await bt.get(`/product-tags/${e}`);return t}},iy=18,zte=({title:e,subtitle:t,baseFilter:n,heroNode:s})=>{const{t:i}=Pt(),l=ss(),[c,d]=rE(),f=c.get("categoryIds")||c.get("categoryId")||"",m=w.useMemo(()=>f?f.split(",").map(Number).filter(ge=>!isNaN(ge)&&ge>0):[],[f]),p=c.get("tagIds")||c.get("tagId")||"",g=w.useMemo(()=>p?p.split(",").map(Number).filter(ge=>!isNaN(ge)&&ge>0):[],[p]),y=c.get("keyword")||"",{data:S}=ci(er.CATALOG_METADATA,async()=>{try{const[ge,Re]=await Promise.all([X3.getCategories({take:50}).catch(()=>null),Pte.getTags({take:50}).catch(()=>null)]),G=ge?.data||[],se=Re?.data||[];return{categories:G,tags:se}}catch(ge){return console.error("Failed to load catalog filter metadata:",ge),{categories:[],tags:[]}}},{revalidateOnFocus:!1}),v=S?.categories||[],N=S?.tags||[],[j,_]=w.useState([]),[k,C]=w.useState(0),[A,U]=w.useState(!0),[B,R]=w.useState(!1),[L,$]=w.useState(null),M=w.useRef(null),H=w.useMemo(()=>j.length<k,[j.length,k]),[ae,te]=w.useState(m),[K,V]=w.useState(g),[E,F]=w.useState(y);w.useEffect(()=>{te(m)},[m]),w.useEffect(()=>{V(g)},[g]),w.useEffect(()=>{F(y)},[y]);const P=w.useCallback(async()=>{U(!0),$(null);try{const ge=await Xi.getProducts({categoryIds:m.length>0?m.join(","):void 0,tagIds:g.length>0?g.join(","):void 0,keyword:y.trim()||void 0,parentId:null,skip:0,take:iy,...n});_(ge.data||[]),C(ge.total||(ge.data?ge.data.length:0))}catch(ge){console.error("Failed to fetch catalog products:",ge),$(i("catalogScreen.loadError"))}finally{U(!1)}},[f,p,y,n,i]);w.useEffect(()=>{P()},[P]);const Y=w.useCallback(async()=>{if(!(A||B||!H)){R(!0);try{const ge=await Xi.getProducts({categoryIds:m.length>0?m.join(","):void 0,tagIds:g.length>0?g.join(","):void 0,keyword:y.trim()||void 0,parentId:null,skip:j.length,take:iy,...n}),Re=ge.data||[];Re.length===0?C(j.length):(_(G=>[...G,...Re]),typeof ge.total=="number"&&C(ge.total))}catch(ge){console.error("Failed to fetch more catalog products:",ge)}finally{R(!1)}}},[A,B,H,m,g,y,j.length]),q=w.useRef(Y);w.useEffect(()=>{q.current=Y},[Y]),w.useEffect(()=>{const ge=M.current;if(!ge||!H||A||B)return;const Re=new IntersectionObserver(G=>{G[0].isIntersecting&&q.current()},{threshold:.1,rootMargin:"200px"});return Re.observe(ge),()=>{Re.unobserve(ge)}},[H,A,B]);const D=w.useCallback(ge=>{ge&&ge.preventDefault();const Re=new URLSearchParams;ae.length>0&&Re.set("categoryIds",ae.join(",")),K.length>0&&Re.set("tagIds",K.join(",")),E.trim()&&Re.set("keyword",E.trim()),d(Re)},[ae,K,E,d]),X=w.useCallback(()=>{F("");const ge=new URLSearchParams(c);ge.delete("keyword"),d(ge)},[c,d]),fe=w.useCallback(()=>{te([]),V([]),F(""),d(new URLSearchParams)},[d]),ue=w.useCallback(ge=>{l(`/store/${ge.slug||ge.id}`)},[l]),he=w.useMemo(()=>m.length>0||g.length>0||y!=="",[m,g,y]),ve=w.useMemo(()=>[{value:0,label:i("catalogScreen.allCategories")},...v.map(ge=>({value:ge.id,label:ge.name}))],[v,i]),be=w.useMemo(()=>[{value:0,label:i("catalogScreen.allTags")},...N.map(ge=>({value:ge.id,label:ge.name}))],[N,i]),Ae=w.useMemo(()=>m.map(ge=>{const Re=v.find(G=>G.id===ge);return{id:ge,name:Re?Re.name:`${i("catalogScreen.categoryPrefix")} #${ge}`}}),[v,m,i]),Te=w.useMemo(()=>g.map(ge=>{const Re=N.find(G=>G.id===ge);return{id:ge,name:Re?Re.name:`${i("catalogScreen.tagPrefix")} #${ge}`}}),[N,g,i]),Ve=w.useCallback(ge=>{const Re=m.filter(se=>se!==ge);te(Re);const G=new URLSearchParams(c);Re.length>0?G.set("categoryIds",Re.join(",")):(G.delete("categoryIds"),G.delete("categoryId")),d(G)},[m,c,d]),le=w.useCallback(ge=>{const Re=g.filter(se=>se!==ge);V(Re);const G=new URLSearchParams(c);Re.length>0?G.set("tagIds",Re.join(",")):(G.delete("tagIds"),G.delete("tagId")),d(G)},[g,c,d]),oe=w.useMemo(()=>i("catalogScreen.allCategories"),[i]),je=w.useMemo(()=>i("catalogScreen.allTags"),[i]),$e=w.useMemo(()=>i("catalogScreen.searchPlaceholder"),[i]),Ge=w.useMemo(()=>i("catalogScreen.noProducts"),[i]),St=w.useMemo(()=>i("catalogScreen.clearFilter"),[i]);return a.jsxs("div",{className:"w-full space-y-6",children:[s,a.jsxs("div",{className:"flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface/85 backdrop-blur-xl border border-border/80 shadow-lg relative z-30",children:[a.jsxs("div",{className:"space-y-1",children:[a.jsxs("h1",{className:"text-xl sm:text-2xl font-black text-text tracking-tight uppercase flex items-center gap-2.5",children:[a.jsx("div",{className:"w-1.5 h-6 rounded-full bg-gradient-to-b from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] shadow-[0_0_12px_rgba(255,27,112,0.6)]"}),a.jsx("span",{children:e})]}),a.jsx("p",{className:"text-xs text-text-muted",children:t})]}),a.jsxs("form",{onSubmit:D,className:"flex flex-wrap items-center gap-2.5",children:[a.jsxs("div",{className:"relative w-48 sm:w-60 focus-within:w-64 transition-all",children:[a.jsx("input",{type:"text",value:E,onChange:ge=>F(ge.target.value),placeholder:$e,className:"w-full bg-background/90 border border-border/80 rounded-xl pl-9 pr-8 py-2.5 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"}),a.jsx(hi,{className:"w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2"}),E&&a.jsx("button",{type:"button",onClick:X,className:"absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer",children:a.jsx(Yt,{className:"w-3.5 h-3.5"})})]}),a.jsx(Vm,{multiple:!0,options:ve,value:ae,onChange:ge=>te(Array.isArray(ge)?ge:[ge]),placeholder:oe,prefixLabel:i("catalogScreen.categoryPrefix"),icon:a.jsx(XB,{className:"w-3.5 h-3.5"}),align:"right"}),N.length>0&&a.jsx(Vm,{multiple:!0,options:be,value:K,onChange:ge=>V(Array.isArray(ge)?ge:[ge]),placeholder:je,prefixLabel:i("catalogScreen.tagPrefix"),icon:a.jsx(NC,{className:"w-3.5 h-3.5"}),align:"right"}),a.jsxs(Ue,{type:"submit",className:"px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] text-white font-black text-xs inline-flex items-center gap-1.5 hover:shadow-[0_0_18px_rgba(255,27,112,0.5)] transition-all cursor-pointer shadow-sm active:scale-95 border-0",children:[a.jsx(hi,{className:"w-3.5 h-3.5 text-white"}),a.jsx("span",{className:"hidden sm:inline",children:i("catalogScreen.searchButton")})]}),he&&a.jsx(Ue,{type:"button",variant:"outline",onClick:fe,className:"px-3 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 cursor-pointer active:scale-95",title:St,children:a.jsx(B2,{className:"w-3.5 h-3.5"})})]})]}),he&&a.jsxs("div",{className:"flex items-center gap-2 flex-wrap text-xs p-3 rounded-lg bg-surface border border-border",children:[a.jsx("span",{className:"text-text-muted font-medium",children:i("catalogScreen.filtering")}),Ae.map(ge=>a.jsxs("span",{className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium border border-primary/20",children:[a.jsx("span",{children:ge.name}),a.jsx("button",{type:"button",onClick:()=>Ve(ge.id),className:"hover:text-text cursor-pointer",children:a.jsx(Yt,{className:"w-3 h-3"})})]},`cat-chip-${ge.id}`)),Te.map(ge=>a.jsxs("span",{className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium border border-primary/20",children:[a.jsx("span",{children:ge.name}),a.jsx("button",{type:"button",onClick:()=>le(ge.id),className:"hover:text-text cursor-pointer",children:a.jsx(Yt,{className:"w-3 h-3"})})]},`tag-chip-${ge.id}`)),y&&a.jsxs("span",{className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium border border-primary/20",children:[a.jsxs("span",{children:['"',y,'"']}),a.jsx("button",{type:"button",onClick:X,className:"hover:text-text cursor-pointer",children:a.jsx(Yt,{className:"w-3 h-3"})})]}),a.jsx("span",{className:"text-text-muted font-medium ml-auto",children:i("catalogScreen.showingProgress",{loaded:j.length,total:k})})]}),A&&a.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",children:Array.from({length:iy}).map((ge,Re)=>a.jsxs("div",{className:"rounded-xl bg-card border border-border p-3 space-y-2 animate-pulse",children:[a.jsx("div",{className:"w-full aspect-[4/5] rounded-lg bg-surface-2"}),a.jsx("div",{className:"h-3 bg-surface-2 rounded-md w-3/4"}),a.jsx("div",{className:"h-3 bg-surface-2 rounded-md w-1/2"})]},Re))}),!A&&L&&a.jsxs("div",{className:"py-12 text-center space-y-3",children:[a.jsx(Un,{className:"w-10 h-10 text-text-muted mx-auto"}),a.jsx("p",{className:"text-sm text-text-muted",children:L}),a.jsxs(Ue,{type:"button",onClick:()=>P(),className:"px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(nr,{className:"w-4 h-4"}),a.jsx("span",{children:i("common.buttons.retry")})]})]}),!A&&!L&&j.length===0&&a.jsxs("div",{className:"py-16 text-center space-y-3",children:[a.jsx(Un,{className:"w-10 h-10 text-text-muted mx-auto"}),a.jsx("h3",{className:"text-base font-semibold text-text",children:Ge}),he&&a.jsxs(Ue,{type:"button",onClick:fe,className:"mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(B2,{className:"w-4 h-4"}),a.jsx("span",{children:St})]})]}),!A&&!L&&j.length>0&&a.jsxs(a.Fragment,{children:[a.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4",children:j.map(ge=>a.jsx(kp,{product:ge,onClick:ue},ge.id))}),B&&a.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 pt-4",children:Array.from({length:6}).map((ge,Re)=>a.jsxs("div",{className:"rounded-xl bg-card border border-border p-3 space-y-2 animate-pulse",children:[a.jsx("div",{className:"w-full aspect-[4/5] rounded-lg bg-surface-2"}),a.jsx("div",{className:"h-3 bg-surface-2 rounded-md w-3/4"}),a.jsx("div",{className:"h-3 bg-surface-2 rounded-md w-1/2"})]},`more-skeleton-${Re}`))}),H&&a.jsx("div",{ref:M,className:"h-16 w-full flex items-center justify-center py-4",children:B&&a.jsxs("div",{className:"flex items-center gap-2 text-xs font-semibold text-text-muted",children:[a.jsx(gn,{className:"w-4 h-4 animate-spin text-primary"}),a.jsx("span",{children:i("catalogScreen.loadingMore")})]})}),!H&&a.jsx("div",{className:"py-6 text-center text-xs text-text-muted font-medium border-t border-border mt-4",children:a.jsx("span",{children:i("catalogScreen.allLoaded",{total:k})})})]})]})},Fte=()=>{const{t:e}=Pt(),t=ss(),n=w.useCallback(()=>{t("/store")},[t]);return a.jsxs("div",{className:"w-full space-y-4",children:[a.jsx("div",{className:"flex items-center justify-between",children:a.jsxs(Ue,{type:"button",variant:"outline",onClick:n,className:"px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-surface transition-colors text-text-muted hover:text-text border-border",children:[a.jsx(id,{className:"w-4 h-4"}),a.jsx("span",{children:e("catalogScreen.backToStore")})]})}),a.jsx(zte,{title:e("catalogScreen.allGamesTitle"),subtitle:e("catalogScreen.allGamesSubtitle")})]})},Ite=e=>{if(e.thumbnail?.url)return e.thumbnail.url;const t=e.variants&&e.variants.length>0?e.variants:e.variations;return t&&t.length>0?t[0].thumbnail?.url??null:null},Bte=e=>{const t=e.variants&&e.variants.length>0?e.variants:e.variations,n=t&&t.length>0?e.regularPrice&&Number(e.regularPrice)>0?e:t[0]:e,s=typeof n?.regularPrice=="string"?parseFloat(n.regularPrice):n?.regularPrice??0,i=n?.salePrice!==null&&n?.salePrice!==void 0&&n?.salePrice!==""?typeof n.salePrice=="string"?parseFloat(n.salePrice):n.salePrice:null,l=i!==null&&i>0&&s>i;return{current:l&&i!==null?i:s,original:l?s:null,hasDiscount:l,percent:l&&s>0&&i!==null?Math.round((s-i)/s*100):0}},Ute=e=>e.categories&&e.categories.length>0?e.categories[0].name:"GAME",AT=6e3,Vte=({products:e,onProductClick:t,className:n})=>{const{t:s}=Pt(),i=w.useMemo(()=>e&&e.length>0?e.slice(0,5):[],[e]),[l,c]=w.useState(0),[d,f]=w.useState(!1),m=w.useRef(null),p=w.useCallback(N=>{c(N)},[]),g=w.useCallback(()=>{c(N=>(N-1+i.length)%i.length)},[i.length]),y=w.useCallback(()=>{c(N=>(N+1)%i.length)},[i.length]);w.useEffect(()=>{if(m.current&&clearInterval(m.current),!(d||i.length<=1))return m.current=setInterval(()=>{c(N=>(N+1)%i.length)},AT),()=>{m.current&&clearInterval(m.current)}},[d,i.length]);const S=w.useCallback(N=>{N===l?t?.(i[N]):p(N)},[l,i,t,p]),v=w.useCallback(N=>{N.key==="ArrowLeft"?(N.preventDefault(),g()):N.key==="ArrowRight"&&(N.preventDefault(),y())},[g,y]);return i.length===0?null:a.jsxs("div",{tabIndex:0,onKeyDown:v,onMouseEnter:()=>f(!0),onMouseLeave:()=>f(!1),className:et("w-full select-none flex flex-col gap-4 relative outline-none",n),role:"region","aria-label":s("catalogScreen.featuredGames"),children:[a.jsx("div",{className:"pointer-events-none absolute -inset-2 rounded-3xl bg-hero-glow opacity-30 dark:opacity-20 blur-xl"}),a.jsxs("div",{className:et("w-full relative flex items-stretch overflow-hidden rounded-2xl border border-border/80 bg-background/90 backdrop-blur-md shadow-2xl","h-[340px] sm:h-[400px] md:h-[450px] lg:h-[490px]"),children:[i.map((N,j)=>{const _=j===l,k=Ite(N),C=Bte(N),A=Ute(N);return a.jsxs("div",{onClick:()=>S(j),className:et("relative overflow-hidden cursor-pointer shrink-0 border-r border-white/10 last:border-r-0","transition-[flex] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]","-skew-x-4 first:-ml-8 last:-mr-8",_?"flex-[4.5]":"flex-[1] hover:flex-[1.2]"),children:[a.jsxs("div",{className:"absolute inset-0 w-[calc(100%+60px)] -ml-[30px] skew-x-4 pointer-events-none",children:[k?a.jsx("img",{src:k,alt:N.title,className:et("absolute inset-0 w-full h-full object-cover object-center origin-center transition-all duration-1000",_?"scale-105":"scale-100 group-hover:scale-105"),style:{filter:_?"brightness(0.9) contrast(1.05)":"brightness(0.35) saturate(0.6)",transitionProperty:"filter, transform",transitionDuration:_?"800ms":"600ms",transitionTimingFunction:"ease-out"},draggable:!1},`img-${N.id}`):a.jsx("div",{className:"absolute inset-0 bg-surface"}),a.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-700",style:{opacity:_?1:.7}}),a.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-black/85 via-black/25 to-transparent transition-opacity duration-700",style:{opacity:_?1:0}}),_&&a.jsx("div",{className:"absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF1B70] via-[#F06A4F] to-[#8DEAF0]"})]}),a.jsx("div",{className:et("absolute inset-0 skew-x-4 flex items-center justify-center pointer-events-none","transition-all duration-500",_?"opacity-0 translate-y-4":"opacity-100 translate-y-0"),children:a.jsxs("div",{className:"flex flex-col items-center gap-3 -rotate-90 origin-center whitespace-nowrap",children:[a.jsx("span",{className:"text-white/60 font-bold text-xs tracking-widest uppercase truncate max-w-[200px]",children:N.title}),C.hasDiscount&&a.jsxs("span",{className:"px-1.5 py-0.5 rounded bg-rose-500/80 text-white text-[9px] font-extrabold",children:["-",C.percent,"%"]})]})}),a.jsxs("div",{className:et("absolute inset-0 skew-x-4 flex flex-col justify-end z-10","p-6 sm:p-8 md:p-10","transition-all duration-700 ease-out",_?"opacity-100 translate-y-0 delay-150":"opacity-0 translate-y-8 pointer-events-none"),children:[a.jsxs("div",{className:"flex items-center gap-2 mb-3 flex-wrap",children:[a.jsxs("span",{className:"inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 text-[#8DEAF0] font-bold text-[11px] uppercase tracking-wider backdrop-blur-md border border-[#8DEAF0]/30 shadow-sm",children:[a.jsx(fn,{className:"w-3 h-3 text-[#8DEAF0]"}),A]}),C.hasDiscount&&a.jsxs("span",{className:"inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-extrabold shadow-glow-secondary",children:[a.jsx(NC,{className:"w-3 h-3"}),"-",C.percent,"%"]})]}),a.jsx("h2",{className:"text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-md line-clamp-2 max-w-3xl mb-3",children:N.title}),N.seoDescription&&a.jsx("p",{className:"text-xs sm:text-sm text-text-muted line-clamp-2 max-w-xl mb-4",children:N.seoDescription}),a.jsxs("div",{className:"flex items-center gap-4 sm:gap-6 flex-wrap mt-1",children:[a.jsx("div",{className:"flex flex-col",children:a.jsxs("div",{className:"flex items-baseline gap-2.5",children:[a.jsxs("span",{className:"text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#FF1B70] via-[#FF8A3D] to-[#FFB800] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,100,50,0.35)] tracking-tight",children:[C.current.toLocaleString("vi-VN")," ₫"]}),C.hasDiscount&&C.original!==null&&a.jsxs("span",{className:"text-xs sm:text-sm line-through text-white/40 font-medium",children:[C.original.toLocaleString("vi-VN")," ₫"]})]})}),a.jsx("button",{type:"button",onClick:U=>{U.stopPropagation(),t?.(N)},className:et("relative group/btn overflow-hidden rounded-xl bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] px-6 py-3 font-black text-white shadow-[0_0_25px_rgba(255,27,112,0.45),0_0_12px_rgba(255,184,0,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(255,27,112,0.6),0_0_15px_rgba(255,184,0,0.4)] active:scale-95 cursor-pointer"),children:a.jsxs("span",{className:"relative z-10 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wide",children:[a.jsx(tl,{className:"w-4 h-4"}),a.jsx("span",{children:s("catalogScreen.buyNow")}),a.jsx(Ur,{className:"w-4 h-4 group-hover/btn:translate-x-1 transition-transform"})]})})]})]})]},`panel-${N.id}`)}),a.jsx("button",{type:"button",onClick:N=>{N.stopPropagation(),g()},"aria-label":s("catalogScreen.prevSlide"),className:et("absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full","bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md","transition-all duration-300 cursor-pointer hover:scale-110 shadow-lg",d?"opacity-100 translate-x-0":"opacity-0 -translate-x-3 pointer-events-none"),children:a.jsx(rc,{className:"w-5 h-5"})}),a.jsx("button",{type:"button",onClick:N=>{N.stopPropagation(),y()},"aria-label":s("catalogScreen.nextSlide"),className:et("absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full","bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md","transition-all duration-300 cursor-pointer hover:scale-110 shadow-lg",d?"opacity-100 translate-x-0":"opacity-0 translate-x-3 pointer-events-none"),children:a.jsx(Ca,{className:"w-5 h-5"})})]}),a.jsx("div",{className:"flex items-center justify-center gap-2.5 pt-1",children:i.map((N,j)=>{const _=j===l;return a.jsx("button",{type:"button",onClick:()=>p(j),title:N.title,className:et("relative rounded-full overflow-hidden cursor-pointer transition-all duration-500",_?"w-12 sm:w-16 h-2.5 bg-surface-2 border border-primary/40 shadow-[0_0_12px_rgba(255,27,112,0.45)]":"w-2.5 h-2.5 bg-surface hover:bg-surface-2 border border-border"),children:_&&a.jsx("div",{className:"absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] rounded-full",style:{animation:d?"none":`progressFill ${AT}ms linear forwards`,width:d?"100%":void 0}})},`dot-${N.id}`)})})]})},$te=["deluxe membership","random key steam"],Hte=e=>{const t=e.toLowerCase();return t.includes("hành động")||t.includes("action")||t.includes("bắn súng")||t.includes("fps")?a.jsx(sU,{className:"w-4 h-4 text-[#F06A4F]"}):t.includes("nhập vai")||t.includes("rpg")||t.includes("phiêu lưu")||t.includes("adventure")?a.jsx(fn,{className:"w-4 h-4 text-[#8DEAF0]"}):t.includes("thể thao")||t.includes("sport")||t.includes("đua xe")||t.includes("racing")?a.jsx(uU,{className:"w-4 h-4 text-[#F5B85B]"}):t.includes("hot")||t.includes("bán chạy")||t.includes("bestseller")||t.includes("nổi bật")?a.jsx(cv,{className:"w-4 h-4 text-[#EF4444]"}):t.includes("chiến thuật")||t.includes("strategy")||t.includes("thủ thành")?a.jsx(js,{className:"w-4 h-4 text-[#22C55E]"}):a.jsx(Un,{className:"w-4 h-4 text-primary"})},qte=()=>{const{t:e}=Pt(),t=ss(),n=w.useRef(null),[s,i]=w.useState(""),l=w.useCallback(R=>{R.preventDefault(),s.trim()?t(`/store/all?keyword=${encodeURIComponent(s.trim())}`):t("/store/all")},[s,t]),c=w.useCallback(()=>{i("")},[]),d=w.useCallback(()=>{t("/store/all")},[t]);w.useEffect(()=>{n.current&&mA(n.current)},[n]);const{data:f,isLoading:m,error:p,mutate:g}=ci(er.STORE_DATA,async()=>{const R=await X3.getCategories({take:50}),L=(R.data||[]).filter(E=>!$te.includes(E.name.trim().toLowerCase())),$=4,M=[];for(let E=0;E<L.length;E+=$){const F=L.slice(E,E+$),P=await Promise.all(F.map(async Y=>{try{const q=await Xi.getProducts({categoryId:Y.id,parentId:null,take:60});return{category:Y,products:q.data||[]}}catch(q){return console.error(`Failed to fetch products for category ${Y.id}:`,q),{category:Y,products:[]}}}));M.push(...P)}const H=6,ae=12,te=new Set,K=[];for(const E of M){const F=[];for(const q of E.products)te.has(q.id)||F.push(q);const P=new Set(K.length>0?K[K.length-1].products.map(q=>q.id):[]),Y=[...F];if(Y.length<H){for(const q of E.products)if(!Y.some(D=>D.id===q.id)&&!P.has(q.id)&&(Y.push(q),Y.length>=H))break}if(Y.length<H){for(const q of E.products)if(!Y.some(D=>D.id===q.id)&&(Y.push(q),Y.length>=H))break}if(Y.length>=4){const q=Y.slice(0,ae);q.forEach(D=>te.add(D.id)),K.push({category:E.category,products:q})}}const V=K.flatMap(E=>E.products);return{categoryGroups:K,heroProducts:V.slice(0,5),allCategories:R.data||[]}}),y=w.useMemo(()=>f?.categoryGroups||[],[f?.categoryGroups]),S=w.useMemo(()=>f?.heroProducts||[],[f?.heroProducts]),v=w.useMemo(()=>f?.allCategories||[],[f?.allCategories]),N=p?e("catalogScreen.loadError"):null,j=w.useCallback(R=>{t(`/store/all?categoryId=${R}`)},[t]),_=w.useCallback(R=>{t(`/store/${R.slug||R.id}`)},[t]),k=w.useMemo(()=>v.find(R=>R.slug==="combo-game-series"||R.name.toLowerCase().includes("combo")),[v]),C=w.useMemo(()=>v.find(R=>R.slug==="deluxe-membership"||R.name.toLowerCase().includes("membership")),[v]),A=w.useMemo(()=>v.find(R=>R.slug==="random-key-steam"||R.name.toLowerCase().includes("random")),[v]),U=w.useCallback(R=>{t(R?`/store/all?categoryId=${R}`:"/store/all")},[t]),B=w.useMemo(()=>[{id:"combo",image:"/combo.jpg",title:e("catalogScreen.banners.comboTitle"),alt:e("catalogScreen.banners.comboAlt"),categoryId:k?.id??182},{id:"membership",image:"/membership.jpg",title:e("catalogScreen.banners.membershipTitle"),alt:e("catalogScreen.banners.membershipAlt"),categoryId:C?.id??179},{id:"random",image:"/random.png",title:e("catalogScreen.banners.randomTitle"),alt:e("catalogScreen.banners.randomAlt"),categoryId:A?.id??180}],[e,k?.id,C?.id,A?.id]);return m?a.jsxs("div",{className:"w-full space-y-8 pb-10",children:[a.jsx("div",{className:"w-full h-20 rounded-2xl bg-surface/70 border border-border/50 animate-pulse"}),a.jsx("div",{className:"w-full h-[340px] sm:h-[400px] md:h-[450px] lg:h-[490px] rounded-2xl bg-surface/80 border border-border/50 animate-pulse"}),a.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4.5",children:Array.from({length:3}).map((R,L)=>a.jsx("div",{className:"w-full aspect-[2.34/1] rounded-2xl bg-surface/80 border border-border/50 animate-pulse"},`banner-skel-${L}`))}),Array.from({length:2}).map((R,L)=>a.jsxs("div",{className:"space-y-4",children:[a.jsxs("div",{className:"flex items-center gap-3",children:[a.jsx("div",{className:"w-1.5 h-6 rounded-full bg-primary/40 animate-pulse"}),a.jsx("div",{className:"w-40 h-6 rounded-md bg-surface border border-border/50 animate-pulse"})]}),a.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3.5 md:gap-4.5",children:Array.from({length:6}).map(($,M)=>a.jsxs("div",{className:"rounded-2xl bg-card border border-border/50 p-3 space-y-3 animate-pulse",children:[a.jsx("div",{className:"w-full aspect-[4/5] bg-surface rounded-xl"}),a.jsxs("div",{className:"space-y-2 px-1",children:[a.jsx("div",{className:"h-4 bg-surface rounded w-full"}),a.jsx("div",{className:"h-4 bg-surface rounded w-2/3"})]})]},`skel-card-${M}`))})]},`skel-row-${L}`))]}):N?a.jsxs("div",{className:"flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center",children:[a.jsx("p",{className:"text-sm text-text-muted",children:N}),a.jsxs(Ue,{onClick:()=>g(),variant:"outline",className:"text-sm",children:[a.jsx(nr,{className:"w-4 h-4 mr-2"}),e("common.buttons.retry")]})]}):a.jsxs("div",{className:"w-full space-y-8 pb-10 relative",ref:n,children:[a.jsx("div",{className:"pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[90%] h-64 bg-hero-glow opacity-30 dark:opacity-20 blur-3xl -z-10"}),a.jsxs("div",{className:"relative overflow-hidden flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface/85 backdrop-blur-xl border border-border/80 shadow-lg",children:[a.jsx("div",{className:"pointer-events-none absolute -top-12 -left-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl"}),a.jsxs("div",{className:"space-y-1 relative z-10",children:[a.jsxs("div",{className:"flex items-center gap-3",children:[a.jsx("div",{className:"w-1.5 h-6 rounded-full bg-gradient-to-b from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] shadow-[0_0_12px_rgba(255,27,112,0.6)]"}),a.jsx("h1",{className:"text-xl sm:text-2xl font-black text-text tracking-tight uppercase",children:e("catalogScreen.title")}),a.jsxs("span",{className:"hidden sm:inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-bold text-success shadow-sm",children:[a.jsx("span",{className:"h-2 w-2 rounded-full bg-success animate-pulse"}),e("catalogScreen.onlineStatus")]})]}),a.jsx("p",{className:"text-xs text-text-muted max-w-md",children:e("catalogScreen.subtitle")})]}),a.jsxs("div",{className:"flex items-center gap-2.5 flex-wrap sm:flex-nowrap relative z-10",children:[a.jsx("form",{onSubmit:l,className:"relative flex-1 sm:w-80 md:w-96 group",children:a.jsxs("div",{className:"relative flex items-center bg-background/90 hover:bg-background border border-border/90 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 rounded-xl transition-all duration-300 shadow-inner group-focus-within:shadow-[0_0_20px_rgba(255,27,112,0.25)]",children:[a.jsx(hi,{className:"w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors ml-3.5 shrink-0"}),a.jsx("input",{type:"text",value:s,onChange:R=>i(R.target.value),placeholder:e("catalogScreen.searchPlaceholder"),className:"w-full bg-transparent pl-3 pr-2 py-2.5 text-xs text-text placeholder:text-text-muted outline-none"}),s&&a.jsx("button",{type:"button",onClick:c,"aria-label":e("catalogScreen.clearFilter"),className:"p-1 mr-1 text-text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors cursor-pointer shrink-0",children:a.jsx(Yt,{className:"w-3.5 h-3.5"})}),a.jsxs("button",{type:"submit",className:"mr-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-[#FF6B4A] hover:opacity-95 text-white text-xs font-bold transition-all shadow-glow-primary active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5",children:[a.jsx(hi,{className:"w-3 h-3"}),a.jsx("span",{className:"hidden sm:inline",children:e("catalogScreen.searchButton")})]})]})}),a.jsxs("button",{type:"button",onClick:d,className:"group relative p-[1px] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(255,27,112,0.5)] active:scale-95 transition-all duration-300 shrink-0",children:[a.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-[#FF1B70] via-[#FF6B4A] to-[#FFB800] opacity-85 group-hover:opacity-100 transition-opacity"}),a.jsxs("div",{className:"relative px-4 py-2.5 rounded-[11px] bg-surface/90 group-hover:bg-surface/75 transition-colors flex items-center gap-2 text-xs font-bold text-text",children:[a.jsx(Un,{className:"w-4 h-4 text-[#FF6B4A] transition-transform group-hover:scale-110"}),a.jsx("span",{className:"group-hover:text-white transition-colors",children:e("catalogScreen.browseAll")}),a.jsx(Ur,{className:"w-3.5 h-3.5 text-[#FFB800] transition-transform group-hover:translate-x-0.5"})]})]})]})]}),S.length>0&&a.jsx(Vte,{products:S,onProductClick:_}),a.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4.5",children:B.map(R=>a.jsx("button",{type:"button",onClick:()=>U(R.categoryId),className:"group relative w-full overflow-hidden rounded-2xl border border-border/80 bg-surface/80 p-0 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(255,27,112,0.35)] active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm",title:R.title,"aria-label":R.alt,children:a.jsxs("div",{className:"relative aspect-[2.34/1] w-full overflow-hidden rounded-2xl bg-surface",children:[a.jsx("img",{src:R.image,alt:R.alt,className:"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",loading:"lazy"}),a.jsx("div",{className:"pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"}),a.jsx("div",{className:"pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-primary/40 transition-colors duration-300"})]})},R.id))}),y.map(({category:R,products:L})=>a.jsxs("section",{id:`store-category-${R.id}`,className:"space-y-4 pt-2 scroll-mt-20",children:[a.jsxs("div",{className:"flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border/50 backdrop-blur-sm",children:[a.jsxs("div",{className:"flex items-center gap-3",children:[a.jsx("div",{className:"p-2 rounded-lg bg-surface border border-border",children:Hte(R.name)}),a.jsxs("div",{className:"flex items-center gap-2.5",children:[a.jsx("h2",{className:"text-base sm:text-lg font-black text-text tracking-tight",children:R.name}),a.jsx("span",{className:"hidden sm:inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-surface-2 border border-border text-text-muted",children:e("catalogScreen.allProductsCount",{count:L.length})})]})]}),a.jsxs("button",{type:"button",onClick:()=>j(R.id),className:"group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer",children:[a.jsx("span",{children:e("catalogScreen.viewAll")}),a.jsx(Ur,{className:"w-3.5 h-3.5 transition-transform group-hover:translate-x-1"})]})]}),a.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3.5 md:gap-4.5",children:L.map($=>a.jsx(kp,{product:$,onClick:_},$.id))})]},R.id))]})},Gte=()=>{const{t:e}=Pt();return a.jsxs("div",{className:"w-full max-w-[1600px] mx-auto py-10 px-4 sm:px-8 lg:px-12",children:[a.jsxs("div",{className:"mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700",children:[a.jsx("div",{className:"w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-6",children:a.jsx(vm,{className:"w-10 h-10"})}),a.jsx("h1",{className:"text-3xl sm:text-4xl font-black text-text tracking-tight mb-4",children:e("policyPages.termsTitle")}),a.jsx("p",{className:"text-text-muted font-medium max-w-2xl mx-auto leading-relaxed",children:"Khi truy cập và mua hàng trên hệ thống Deluxe Gaming, khách hàng đồng ý tuân thủ các điều khoản sử dụng và chính sách được quy định dưới đây. Chúng tôi khuyến khích khách hàng đọc kỹ thông tin trước khi mua để hiểu rõ phạm vi sản phẩm, quyền truy cập và trách nhiệm của các bên."})]}),a.jsxs("div",{className:"space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both",children:[a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"1"}),"Điều khoản chung"]}),a.jsxs("div",{className:"space-y-3 text-sm text-text-muted leading-relaxed",children:[a.jsx("p",{children:"Deluxe Gaming là nền tảng cung cấp các sản phẩm kỹ thuật số liên quan đến trò chơi điện tử, bao gồm quyền tải xuống, quyền truy cập, mã kích hoạt và các hình thức cung cấp khác được mô tả cụ thể trên từng sản phẩm."}),a.jsx("p",{children:"Khi sử dụng website hoặc mua hàng, khách hàng mặc định đồng ý với các điều khoản được công bố tại trang này."}),a.jsx("p",{children:"Deluxe Gaming có quyền cập nhật, sửa đổi hoặc bổ sung điều khoản khi cần thiết. Các thay đổi sẽ được công bố trên hệ thống."}),a.jsx("p",{children:"Deluxe Gaming cung cấp sản phẩm kỹ thuật số theo hình thức và phạm vi quyền được mô tả tại từng trang sản phẩm. Tùy từng sản phẩm, khách hàng có thể được cung cấp mã kích hoạt, quyền tải xuống và/hoặc quyền truy cập trò chơi trên nền tảng tương ứng."})]})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"2"}),"Phạm vi quyền được cung cấp"]}),a.jsxs("div",{className:"space-y-3 text-sm text-text-muted leading-relaxed mb-5",children:[a.jsx("p",{children:"Sản phẩm của Deluxe Gaming có thể cung cấp cho khách hàng quyền tải xuống và truy cập trò chơi theo hình thức được mô tả trên trang sản phẩm."}),a.jsx("p",{children:"Quyền tải xuống hoặc truy cập trò chơi không đồng nghĩa với việc Deluxe Gaming chuyển giao quyền sở hữu trí tuệ hoặc License (giấy phép bản quyền) của trò chơi cho khách hàng."}),a.jsx("p",{children:"Trừ khi sản phẩm được ghi rõ có bao gồm License hoặc quyền sử dụng tương ứng, khách hàng không được hiểu rằng mình đã nhận quyền sở hữu, chuyển nhượng bản quyền hoặc quyền khai thác thương mại đối với trò chơi."}),a.jsx("p",{children:"Mọi quyền sở hữu trí tuệ liên quan đến trò chơi, bao gồm nhưng không giới hạn ở mã nguồn, hình ảnh, âm thanh, thương hiệu, nội dung và tài sản kỹ thuật số, thuộc về nhà phát triển, nhà phát hành hoặc chủ sở hữu quyền tương ứng."}),a.jsx("p",{children:"Việc mua sản phẩm không đồng nghĩa với việc chuyển giao quyền sở hữu trí tuệ, mã nguồn, thương hiệu hoặc quyền khai thác thương mại đối với trò chơi. Các quyền liên quan đến trò chơi vẫn thuộc về nhà phát triển, nhà phát hành hoặc chủ sở hữu quyền tương ứng."}),a.jsx("p",{children:"Phạm vi quyền sử dụng của khách hàng được xác định theo loại sản phẩm, phương thức cung cấp, điều kiện kích hoạt và các điều khoản áp dụng của nền tảng/nhà phát hành tại thời điểm sử dụng."})]}),a.jsxs("div",{className:"p-5 rounded-2xl bg-surface border border-border/50",children:[a.jsx("h3",{className:"text-sm font-bold text-text mb-3",children:"Hình thức cung cấp"}),a.jsx("p",{className:"text-sm text-text-muted mb-2",children:"Tùy từng sản phẩm, Deluxe Gaming có thể cung cấp:"}),a.jsxs("ul",{className:"space-y-2 text-sm text-text-muted list-disc list-inside mb-3",children:[a.jsx("li",{children:"Mã kích hoạt kỹ thuật số"}),a.jsx("li",{children:"Steam Key"}),a.jsx("li",{children:"Quyền tải xuống và truy cập trò chơi"}),a.jsx("li",{children:"Tài khoản hoặc phương thức truy cập được mô tả rõ trên trang sản phẩm"}),a.jsx("li",{children:"Các sản phẩm kỹ thuật số khác theo thông tin công bố"})]}),a.jsx("p",{className:"text-sm text-text-muted",children:"Quyền truy cập, thời hạn sử dụng, khu vực áp dụng và các giới hạn khác sẽ được xác định theo mô tả của từng sản phẩm. Khách hàng cần kiểm tra kỹ thông tin sản phẩm trước khi thanh toán."})]})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"3"}),"Điều kiện kỹ thuật và kích hoạt"]}),a.jsx("div",{className:"mb-4 text-sm text-text-muted",children:"Một số sản phẩm có thể yêu cầu:"}),a.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4",children:[a.jsxs("div",{className:"flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50",children:[a.jsx(gC,{className:"w-4 h-4 text-emerald-500 shrink-0"}),a.jsx("span",{className:"text-sm text-text-muted",children:"Khu vực kích hoạt phù hợp"})]}),a.jsxs("div",{className:"flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50",children:[a.jsx(Aa,{className:"w-4 h-4 text-emerald-500 shrink-0"}),a.jsx("span",{className:"text-sm text-text-muted",children:"Tài khoản Steam hoặc nền tảng tương ứng"})]}),a.jsxs("div",{className:"flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50",children:[a.jsx(Sn,{className:"w-4 h-4 text-emerald-500 shrink-0"}),a.jsx("span",{className:"text-sm text-text-muted",children:"Phiên bản nền tảng phù hợp"})]}),a.jsxs("div",{className:"flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50",children:[a.jsx(uc,{className:"w-4 h-4 text-emerald-500 shrink-0"}),a.jsx("span",{className:"text-sm text-text-muted",children:"Kết nối Internet"})]}),a.jsxs("div",{className:"flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50",children:[a.jsx(p9,{className:"w-4 h-4 text-emerald-500 shrink-0"}),a.jsx("span",{className:"text-sm text-text-muted",children:"Cấu hình thiết bị đáp ứng yêu cầu của trò chơi"})]}),a.jsxs("div",{className:"flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50",children:[a.jsx(iU,{className:"w-4 h-4 text-emerald-500 shrink-0"}),a.jsx("span",{className:"text-sm text-text-muted",children:"Các bước cập nhật hoặc kích hoạt theo hướng dẫn"})]})]}),a.jsx("p",{className:"text-sm text-amber-500 font-medium",children:"Khách hàng có trách nhiệm kiểm tra các yêu cầu này trước khi mua sản phẩm."})]}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"4"}),"Trách nhiệm của khách hàng"]}),a.jsxs("ul",{className:"space-y-3 text-sm text-text-muted",children:[a.jsxs("li",{className:"flex gap-2",children:[a.jsx(ku,{className:"w-4 h-4 text-primary shrink-0 mt-0.5"})," ",a.jsx("span",{children:"Cung cấp thông tin chính xác khi tạo tài khoản và thanh toán"})]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx(ku,{className:"w-4 h-4 text-primary shrink-0 mt-0.5"})," ",a.jsx("span",{children:"Kiểm tra kỹ mô tả, khu vực, hình thức cung cấp và điều kiện sử dụng của sản phẩm"})]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx(ku,{className:"w-4 h-4 text-primary shrink-0 mt-0.5"})," ",a.jsx("span",{children:"Bảo mật tài khoản và thông tin đăng nhập của mình"})]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx(ku,{className:"w-4 h-4 text-primary shrink-0 mt-0.5"})," ",a.jsx("span",{children:"Không sử dụng sản phẩm vào mục đích gian lận, lừa đảo hoặc vi phạm pháp luật"})]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx(ku,{className:"w-4 h-4 text-primary shrink-0 mt-0.5"})," ",a.jsx("span",{children:"Không sử dụng key, tài khoản hoặc quyền truy cập được cung cấp để vi phạm điều khoản của Steam hoặc nền tảng liên quan"})]})]}),a.jsxs("div",{className:"mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3",children:[a.jsx(na,{className:"w-5 h-5 text-rose-500 shrink-0 mt-0.5"}),a.jsx("p",{className:"text-sm text-rose-600 dark:text-rose-400 font-medium leading-relaxed",children:"Deluxe Gaming không chịu trách nhiệm đối với việc tài khoản của khách hàng bị hạn chế hoặc khóa do hack, cheat, mod, tool gian lận hoặc các hành vi vi phạm quy định của nền tảng."})]})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"5"}),"Trách nhiệm của Deluxe Gaming"]}),a.jsxs("ul",{className:"space-y-3 text-sm text-text-muted mb-6",children:[a.jsxs("li",{className:"flex gap-2",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"})," Cung cấp sản phẩm đúng với thông tin được công bố"]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"})," Cung cấp đúng hình thức truy cập hoặc kích hoạt của sản phẩm"]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"})," Hỗ trợ khách hàng trong quá trình nhận và sử dụng sản phẩm trong phạm vi chính sách hỗ trợ"]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"})," Hỗ trợ xử lý các vấn đề liên quan đến sản phẩm theo chính sách bảo hành"]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"})," Bảo mật thông tin khách hàng theo chính sách riêng tư được công bố"]})]}),a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"6"}),"Chính sách thanh toán"]}),a.jsxs("div",{className:"space-y-3 text-sm text-text-muted",children:[a.jsx("p",{children:"Hỗ trợ các phương thức: Ví điện tử, Chuyển khoản ngân hàng, Thanh toán thẻ, và các phương thức khác."}),a.jsx("p",{children:"Sau khi thanh toán thành công, hệ thống sẽ xử lý đơn hàng và cung cấp sản phẩm theo hình thức được công bố."}),a.jsx("p",{children:"Đối với sản phẩm giao tự động, key hoặc thông tin truy cập có thể được hiển thị trực tiếp trên hệ thống hoặc gửi đến email của khách hàng."})]})]})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"7"}),"Chính sách hoàn tiền & bảo hành"]}),a.jsxs("ul",{className:"space-y-3 text-sm text-text-muted leading-relaxed",children:[a.jsxs("li",{className:"flex gap-2",children:[a.jsx(Sn,{className:"w-4 h-4 text-emerald-500 shrink-0 mt-0.5"})," ",a.jsx("span",{children:"Key chỉ được xem xét hoàn tiền khi không thể kích hoạt và Deluxe Gaming không thể cung cấp key thay thế hợp lệ."})]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx(Mr,{className:"w-4 h-4 text-rose-500 shrink-0 mt-0.5"})," ",a.jsx("span",{children:"Đối với sản phẩm đã được xem hoặc đã kích hoạt thành công, Deluxe Gaming không hỗ trợ đổi hoặc hoàn tiền, trừ trường hợp được quy định khác trong chính sách bảo hành."})]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"})," ",a.jsx("span",{children:"Các sản phẩm tài khoản hoặc sản phẩm có hình thức cung cấp đặc biệt sẽ áp dụng điều kiện bảo hành riêng được công bố tại thời điểm mua."})]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"})," ",a.jsx("span",{children:"Khách hàng cần kiểm tra cấu hình thiết bị và điều kiện sử dụng trước khi mua."})]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"})," ",a.jsx("span",{children:"Các trường hợp cụ thể được áp dụng theo Chính sách Bảo hành & Hoàn tiền của Deluxe Gaming."})]})]})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm border-l-4 border-l-rose-500",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-sm font-bold text-rose-500 shadow-sm",children:"8"}),"Hành vi nghiêm cấm"]}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[a.jsxs("div",{children:[a.jsx("p",{className:"text-sm font-semibold text-text mb-3",children:"Khách hàng không được:"}),a.jsxs("ul",{className:"space-y-2 text-sm text-text-muted list-disc list-inside",children:[a.jsx("li",{children:"Sử dụng dịch vụ để lừa đảo hoặc gian lận"}),a.jsx("li",{children:"Cố tình khai thác lỗi hệ thống nhằm tạo lợi ích bất hợp pháp"}),a.jsx("li",{children:"Sao chép, sửa đổi hoặc phát tán trái phép nội dung thuộc hệ thống Deluxe Gaming"}),a.jsx("li",{children:"Sử dụng sản phẩm để vi phạm bản quyền hoặc điều khoản của nền tảng"}),a.jsx("li",{children:"Mua hàng bằng phương thức thanh toán gian lận hoặc trái phép"})]})]}),a.jsxs("div",{className:"p-5 rounded-2xl bg-surface-2 border border-border/40",children:[a.jsx("p",{className:"text-sm font-semibold text-rose-500 mb-3",children:"Nếu phát hiện hành vi vi phạm, Deluxe Gaming có quyền:"}),a.jsxs("ul",{className:"space-y-2 text-sm text-text-muted",children:[a.jsxs("li",{className:"flex items-center gap-2",children:[a.jsx(Mr,{className:"w-4 h-4 text-rose-500"})," Từ chối hỗ trợ đối với hành vi vi phạm"]}),a.jsxs("li",{className:"flex items-center gap-2",children:[a.jsx(Mr,{className:"w-4 h-4 text-rose-500"})," Tạm khóa hoặc hạn chế tài khoản trên hệ thống"]}),a.jsxs("li",{className:"flex items-center gap-2",children:[a.jsx(Mr,{className:"w-4 h-4 text-rose-500"})," Hủy các giao dịch có dấu hiệu gian lận theo chính sách"]}),a.jsxs("li",{className:"flex items-center gap-2",children:[a.jsx(Mr,{className:"w-4 h-4 text-rose-500"})," Áp dụng các biện pháp pháp lý phù hợp khi cần thiết"]})]})]})]})]}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"9"}),"Miễn trừ trách nhiệm"]}),a.jsx("p",{className:"text-sm font-medium text-text-muted mb-3",children:"Deluxe Gaming không chịu trách nhiệm đối với các vấn đề phát sinh từ:"}),a.jsxs("ul",{className:"space-y-2 text-sm text-text-muted list-disc list-inside",children:[a.jsx("li",{children:"Khách hàng nhập sai thông tin hoặc mã kích hoạt"}),a.jsx("li",{children:"Kích hoạt sai khu vực"}),a.jsx("li",{children:"Thiết bị không đáp ứng cấu hình yêu cầu"}),a.jsx("li",{children:"Tài khoản bị khóa hoặc hạn chế do vi phạm quy định của Steam hoặc nền tảng liên quan"}),a.jsx("li",{children:"Việc sử dụng hack, cheat, mod, tool hoặc phần mềm không được nền tảng cho phép"}),a.jsx("li",{children:"Các sự cố kỹ thuật từ Steam, nhà phát hành, nhà phát triển hoặc nền tảng bên thứ ba nằm ngoài khả năng kiểm soát"}),a.jsx("li",{children:"Các thiệt hại phát sinh ngoài phạm vi sản phẩm và chính sách hỗ trợ đã công bố"})]})]}),a.jsxs("div",{className:"space-y-6",children:[a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"10"}),"Thay đổi điều khoản"]}),a.jsxs("div",{className:"space-y-3 text-sm text-text-muted",children:[a.jsx("p",{children:"Deluxe Gaming có quyền cập nhật hoặc thay đổi các điều khoản để phù hợp với hoạt động cung cấp dịch vụ."}),a.jsx("p",{children:"Các thay đổi sẽ được công bố trên website hoặc hệ thống của Deluxe Gaming."}),a.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-amber-500 p-3 rounded-xl bg-amber-500/10 mt-2 border border-amber-500/20",children:[a.jsx(vC,{className:"w-4 h-4 shrink-0"}),"Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận phiên bản điều khoản mới."]})]})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"11"}),"Liên hệ hỗ trợ"]}),a.jsx("p",{className:"text-sm text-text-muted mb-4",children:"Nếu có câu hỏi liên quan đến sản phẩm, quyền truy cập, kích hoạt, bảo hành hoặc điều khoản sử dụng, khách hàng có thể liên hệ thông qua:"}),a.jsxs("div",{className:"flex flex-wrap gap-2 text-sm font-medium text-text mb-4",children:[a.jsx("span",{className:"px-3 py-1.5 rounded-lg bg-surface border border-border/50",children:"Email hỗ trợ"}),a.jsx("span",{className:"px-3 py-1.5 rounded-lg bg-surface border border-border/50",children:"Fanpage"}),a.jsx("span",{className:"px-3 py-1.5 rounded-lg bg-surface border border-border/50",children:"Hotline/Zalo"}),a.jsx("span",{className:"px-3 py-1.5 rounded-lg bg-surface border border-border/50",children:"Ticket"})]}),a.jsx("p",{className:"text-sm font-semibold text-primary",children:"Deluxe Gaming hướng tới việc cung cấp thông tin sản phẩm minh bạch, rõ ràng và hỗ trợ khách hàng trong phạm vi quyền truy cập được cung cấp cho từng sản phẩm."})]})]})]}),a.jsxs("section",{className:"p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-card to-surface border border-border/60 shadow-sm mt-12",children:[a.jsxs("div",{className:"text-center mb-8",children:[a.jsxs("h2",{className:"text-2xl font-black text-text mb-4 flex items-center justify-center gap-3",children:[a.jsx(Mo,{className:"w-6 h-6 text-amber-500 fill-amber-500"})," Giới thiệu về Deluxe Gaming"]}),a.jsx("p",{className:"text-primary font-bold text-lg mb-2",children:"Nền tảng cung cấp Steam Key bản quyền uy tín, giá tốt"}),a.jsx("p",{className:"text-sm text-text-muted max-w-3xl mx-auto leading-relaxed",children:"Deluxe Gaming là hệ thống phân phối game bản quyền – Steam Key chính hãng với kho game lớn, đa dạng thể loại, giá cả hợp lý và hỗ trợ người chơi nhanh chóng. Chúng tôi cam kết mang đến cho game thủ Việt Nam trải nghiệm mua game bản quyền dễ dàng – an toàn – nhanh chóng, không lo khóa key hay mất tài khoản."})]}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8 mb-10",children:[a.jsxs("div",{children:[a.jsx("h3",{className:"font-bold text-text mb-4 text-lg",children:"Tại sao nên mua Steam Key tại đây?"}),a.jsxs("ul",{className:"space-y-4",children:[a.jsxs("li",{className:"flex gap-3",children:[a.jsx(na,{className:"w-5 h-5 text-emerald-500 shrink-0 mt-0.5"}),a.jsxs("div",{children:[a.jsx("span",{className:"font-bold text-text block mb-1",children:"Key chính hãng – nói không với crack"}),a.jsx("span",{className:"text-sm text-text-muted",children:"Toàn bộ mã kích hoạt được phân phối từ nguồn chính thống, đảm bảo an toàn khi kích hoạt trên Steam, không bị thu hồi hay khóa tài khoản."})]})]}),a.jsxs("li",{className:"flex gap-3",children:[a.jsx(uc,{className:"w-5 h-5 text-amber-500 shrink-0 mt-0.5"}),a.jsxs("div",{children:[a.jsx("span",{className:"font-bold text-text block mb-1",children:"Hệ thống giao hàng tự động"}),a.jsx("span",{className:"text-sm text-text-muted",children:"Ngay sau khi thanh toán, khách hàng sẽ nhận Steam Key trực tiếp qua email hoặc tài khoản, nhanh chóng và thuận tiện."})]})]})]})]}),a.jsxs("div",{className:"p-6 rounded-2xl bg-surface border border-border/40",children:[a.jsx("h3",{className:"font-bold text-text mb-4 text-lg",children:"Tiêu chí phục vụ"}),a.jsxs("ul",{className:"space-y-3 text-sm text-text-muted font-medium",children:[a.jsxs("li",{className:"flex items-center gap-2",children:[a.jsx(Sn,{className:"w-4 h-4 text-primary"})," Key chính hãng – 100% bản quyền"]}),a.jsxs("li",{className:"flex items-center gap-2",children:[a.jsx(Sn,{className:"w-4 h-4 text-primary"})," Kích hoạt trực tiếp trên Steam"]}),a.jsxs("li",{className:"flex items-center gap-2",children:[a.jsx(Sn,{className:"w-4 h-4 text-primary"})," Nhận key ngay sau khi thanh toán"]}),a.jsxs("li",{className:"flex items-center gap-2",children:[a.jsx(Sn,{className:"w-4 h-4 text-primary"})," Hỗ trợ 24/7"]}),a.jsxs("li",{className:"flex items-center gap-2",children:[a.jsx(Sn,{className:"w-4 h-4 text-primary"})," Nhiều phương thức thanh toán: Ví điện tử, Momo, Ngân hàng, Thẻ..."]})]})]})]}),a.jsxs("div",{className:"border-t border-border/40 pt-8",children:[a.jsxs("h3",{className:"font-black text-text mb-6 text-xl flex items-center gap-2",children:[a.jsx(od,{className:"w-6 h-6 text-primary"})," Câu hỏi thường gặp (FAQ)"]}),a.jsx("div",{className:"space-y-6",children:[{q:"1. Deluxe Gaming cung cấp các loại mô hình sản phẩm gì?",a:["→ Bạn nhận Mã kích hoạt CDKEY, kích hoạt trên tài khoản Steam cá nhân và nhận toàn bộ tính năng Steam cung cấp khi mua các dòng sản phẩm Steam Key","→ Bạn sẽ nhận được tài khoản / quyền truy cập tài khoản Steam Bản Quyền do Deluxe Gaming cung cấp đối với từng sản phẩm bạn mua được gắn Steam Offline / Tài khoản Offline"]},{q:"2. CDKey khác gì Share/Offline Steam?",a:["→ CDKey kích hoạt game vào tài khoản cá nhân, hỗ trợ Steam Cloud, Achievement, Workshop. Steam Offline là game được share tài khoản và chỉ chơi Offline.","→ Sản phẩm này là Steam CDKey. Steam Offline sẽ nhận được quyền truy cập tài khoản và tài khoản, mật khẩu để truy cập"]},{q:"3. CDKey có Share Family không?",a:["→ KHÔNG, bởi sản phẩm các vùng khác nhau không thể chia sẻ. Đây là sản phẩm dành cho cá nhân, giúp tiếp cận mức giá tốt hơn."]},{q:"4. Steam Offline có phải Crack không?",a:["→ Không. Đây là tài khoản Steam bản quyền, được tải và sử dụng các tính năng Steam cung cấp do Deluxe Gaming cung cấp!"]},{q:"5. Có cần chuyển Steam sang Offline không?",a:["→ Không. CDKey có thể chơi trực tiếp ở Online Mode Steam.","→ Có. Đối với các sản phẩm Steam Offline sẽ cần chuyển Offline Mode trước khi chơi để đảm bảo save"]},{q:"6. Hệ điều hành nào được hỗ trợ?",a:["→ Hỗ trợ Windows và Steam 64-bit đối với Steam CDKey","→ Hỗ trợ Steam OS, Linux, Window, Mac OS đối với sản phẩm thuộc Steam Offline"]},{q:"7. Máy không đủ cấu hình có hoàn tiền không?",a:["→ Không hoàn tiền nếu máy không đáp ứng cấu hình tối thiểu. Vui lòng kiểm tra kỹ trước khi mua."]}].map((t,n)=>a.jsxs("div",{className:"p-4 rounded-xl bg-background border border-border/40 shadow-sm",children:[a.jsx("p",{className:"font-bold text-text text-sm mb-2",children:t.q}),a.jsx("div",{className:"space-y-1",children:t.a.map((s,i)=>a.jsx("p",{className:"text-sm text-text-muted",children:s},i))})]},n))})]})]}),a.jsxs("div",{className:"mt-12 text-center p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-surface to-background border border-border/50",children:[a.jsx("h2",{className:"text-xl font-bold text-text mb-2",children:"Deluxe Gaming – Uy tín tạo niềm tin"}),a.jsx("p",{className:"text-sm text-text-muted max-w-2xl mx-auto mb-4",children:"Thường xuyên có các chương trình giảm giá theo mùa, Flash Sale và khuyến mãi dành cho thành viên, giúp game thủ sở hữu tựa game yêu thích với chi phí hợp lý nhất. Nếu bạn đang tìm nơi mua game bản quyền đáng tin cậy, hãy lựa chọn Deluxe Gaming ngay hôm nay."}),a.jsx("div",{className:"flex justify-center",children:a.jsx(fn,{className:"w-5 h-5 text-amber-500"})})]})]})]})},Kte=()=>{const{t:e}=Pt();return a.jsxs("div",{className:"w-full max-w-4xl mx-auto py-8",children:[a.jsxs("div",{className:"mb-10 text-center",children:[a.jsx("div",{className:"w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4",children:a.jsx(js,{className:"w-8 h-8"})}),a.jsx("h1",{className:"text-2xl sm:text-3xl font-black text-text tracking-tight mb-2",children:e("policyPages.warrantyTitle")}),a.jsx("p",{className:"text-text-muted font-medium max-w-xl mx-auto",children:"Tại Deluxe Gaming, chúng tôi cam kết mang đến trải nghiệm mua game bản quyền an toàn, minh bạch và uy tín. Mọi sản phẩm đều được phân phối từ nguồn chính thống và đi kèm chính sách bảo hành – hỗ trợ rõ ràng nhằm đảm bảo quyền lợi cho khách hàng."})]}),a.jsxs("div",{className:"space-y-8",children:[a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"1"}),"Sản phẩm áp dụng"]}),a.jsxs("ul",{className:"space-y-3 text-text-muted",children:[a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx(Sn,{className:"w-5 h-5 text-emerald-500 shrink-0 mt-0.5"}),a.jsx("span",{children:"Steam Key game bản quyền"})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx(Sn,{className:"w-5 h-5 text-emerald-500 shrink-0 mt-0.5"}),a.jsx("span",{children:"Tài khoản/License game"})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx(Sn,{className:"w-5 h-5 text-emerald-500 shrink-0 mt-0.5"}),a.jsx("span",{children:"Các sản phẩm kích hoạt online mà Deluxe Gaming cung cấp"})]})]})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"2"}),"Chính sách bảo hành"]}),a.jsxs("div",{className:"space-y-6",children:[a.jsxs("div",{children:[a.jsxs("h3",{className:"text-base font-semibold text-text mb-3 flex items-center gap-2",children:[a.jsx("span",{className:"px-2 py-1 rounded-md bg-surface border border-border text-xs font-bold text-primary shadow-sm",children:"2.1"}),"Bảo hành kích hoạt"]}),a.jsx("p",{className:"text-text-muted mb-3",children:"Deluxe Gaming cam kết key hoạt động bình thường khi kích hoạt lần đầu trên Steam. Nếu khách hàng gặp lỗi không kích hoạt được do:"}),a.jsxs("ul",{className:"list-disc list-inside space-y-2 text-text-muted ml-2 mb-4",children:[a.jsx("li",{children:"Key không hợp lệ"}),a.jsx("li",{children:"Trùng key"}),a.jsx("li",{children:"Lỗi từ phía nhà cung cấp"})]}),a.jsx("div",{className:"p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary-foreground font-medium",children:"👉 Chúng tôi sẽ kiểm tra và đổi key mới hoàn toàn miễn phí."})]}),a.jsxs("div",{children:[a.jsxs("h3",{className:"text-base font-semibold text-text mb-3 flex items-center gap-2",children:[a.jsx("span",{className:"px-2 py-1 rounded-md bg-surface border border-border text-xs font-bold text-primary shadow-sm",children:"2.2"}),"Thời gian bảo hành"]}),a.jsxs("ul",{className:"space-y-3 text-text-muted",children:[a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"}),a.jsxs("span",{children:[a.jsx("strong",{children:"Hỗ trợ kích hoạt:"})," trong vòng 24 giờ kể từ thời điểm nhận key."]})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"}),a.jsx("span",{children:"Hỗ trợ khiếu nại ngoài thời gian trên vẫn được xử lý tùy từng trường hợp cụ thể."})]})]})]})]})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"3"}),"Trường hợp không thuộc phạm vi bảo hành"]}),a.jsxs("ul",{className:"space-y-3 text-text-muted",children:[a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx(Mr,{className:"w-5 h-5 text-rose-500 shrink-0 mt-0.5"}),a.jsx("span",{children:"Khách hàng nhập sai định dạng hoặc chọn sai khu vực kích hoạt."})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx(Mr,{className:"w-5 h-5 text-rose-500 shrink-0 mt-0.5"}),a.jsx("span",{children:"Sản phẩm hiển thị lỗi do cấu hình máy hoặc xung đột phần mềm."})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx(Mr,{className:"w-5 h-5 text-rose-500 shrink-0 mt-0.5"}),a.jsx("span",{children:"Tài khoản của khách hàng bị khóa do vi phạm điều khoản Steam (Mod/Hack/Tool…)."})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx(Mr,{className:"w-5 h-5 text-rose-500 shrink-0 mt-0.5"}),a.jsx("span",{children:"Đã kích hoạt thành công nhưng yêu cầu đổi game khác."})]}),a.jsxs("li",{className:"flex items-start gap-3",children:[a.jsx(Mr,{className:"w-5 h-5 text-rose-500 shrink-0 mt-0.5"}),a.jsx("span",{children:"Sản phẩm đã sử dụng nhưng muốn hoàn tiền không lý do."})]})]})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"4"}),"Chính sách hoàn tiền"]}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 mt-6",children:[a.jsxs("div",{className:"p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20",children:[a.jsxs("h3",{className:"text-base font-semibold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2",children:[a.jsx(Sn,{className:"w-5 h-5"}),a.jsx("span",{className:"px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold shadow-sm",children:"4.1"}),"Được hoàn tiền"]}),a.jsxs("ul",{className:"space-y-2 text-text-muted text-sm mb-4",children:[a.jsxs("li",{className:"flex gap-2",children:[a.jsx("span",{className:"text-emerald-500",children:"•"})," Key lỗi hoặc không kích hoạt được và không thể cấp key thay thế"]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("span",{className:"text-emerald-500",children:"•"})," Khách hàng thanh toán trùng đơn và chưa nhận key"]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("span",{className:"text-emerald-500",children:"•"})," Nhầm đơn nhưng chưa xem key hoặc chưa hiển thị mã sản phẩm"]})]}),a.jsxs("div",{className:"pt-4 border-t border-emerald-500/20",children:[a.jsx("p",{className:"text-sm font-medium text-text mb-2",children:"Hình thức hoàn tiền:"}),a.jsxs("div",{className:"flex flex-wrap gap-2 text-xs text-text-muted mb-3",children:[a.jsx("span",{className:"px-2 py-1 rounded bg-surface border border-border",children:"Chuyển khoản"}),a.jsx("span",{className:"px-2 py-1 rounded bg-surface border border-border",children:"Ví điện tử"}),a.jsx("span",{className:"px-2 py-1 rounded bg-surface border border-border",children:"Ví tích lũy"})]}),a.jsx("p",{className:"text-xs text-text-muted italic",children:"Thời gian xử lý: 3–24 giờ làm việc."})]})]}),a.jsxs("div",{className:"p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20",children:[a.jsxs("h3",{className:"text-base font-semibold text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2",children:[a.jsx(Mr,{className:"w-5 h-5"}),a.jsx("span",{className:"px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs font-bold shadow-sm",children:"4.2"}),"Không được hoàn tiền"]}),a.jsxs("ul",{className:"space-y-2 text-text-muted text-sm mb-4",children:[a.jsxs("li",{className:"flex gap-2",children:[a.jsx("span",{className:"text-rose-500",children:"•"})," Đã hiển thị key và khách hàng đã xem"]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("span",{className:"text-rose-500",children:"•"})," Key đã kích hoạt thành công"]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("span",{className:"text-rose-500",children:"•"})," Khách hàng đổi ý sau khi sử dụng"]}),a.jsxs("li",{className:"flex gap-2",children:[a.jsx("span",{className:"text-rose-500",children:"•"})," Vi phạm điều khoản sử dụng Steam dẫn đến khóa tài khoản"]})]}),a.jsxs("div",{className:"p-3 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs leading-relaxed mt-auto",children:[a.jsx("strong",{children:"Lưu ý:"})," Sản phẩm game bản quyền là hàng điện tử tiêu hao, đã xem hoặc sử dụng sẽ không thể thu hồi lại, vì vậy không hỗ trợ hoàn tiền trong các trường hợp này."]})]})]})]}),a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"5"}),"Thời gian hỗ trợ"]}),a.jsx("div",{className:"flex flex-col gap-4",children:a.jsxs("div",{className:"flex items-center gap-4 p-4 rounded-xl bg-surface",children:[a.jsx(wm,{className:"w-6 h-6 text-primary"}),a.jsxs("div",{children:[a.jsx("p",{className:"font-semibold text-text",children:"Hỗ trợ khách hàng 24/7"}),a.jsx("p",{className:"text-sm text-text-muted",children:"Phản hồi trong vòng từ 5 – 60 phút tùy thời điểm."})]})]})})]}),a.jsxs("section",{className:"p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm",children:[a.jsxs("h2",{className:"text-xl font-bold text-text mb-4 flex items-center gap-3",children:[a.jsx("span",{className:"w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm",children:"6"}),"Quy trình yêu cầu"]}),a.jsxs("div",{className:"space-y-4",children:[a.jsxs("div",{children:[a.jsx("p",{className:"text-sm font-medium text-text mb-2",children:"Khách hàng vui lòng cung cấp:"}),a.jsxs("ul",{className:"list-disc list-inside text-sm text-text-muted ml-1",children:[a.jsx("li",{children:"Mã đơn hàng & Email dùng để mua"}),a.jsx("li",{children:"Ảnh chụp lỗi hiển thị trên Steam (nếu có)"})]})]}),a.jsxs("div",{children:[a.jsx("p",{className:"text-sm font-medium text-text mb-2",children:"Kênh tiếp nhận:"}),a.jsx("p",{className:"text-sm text-text-muted",children:"Email hỗ trợ, Fanpage Deluxe Gaming, hoặc Hotline CSKH."})]})]})]})]}),a.jsxs("div",{className:"mt-8 text-center p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-background border border-border/50",children:[a.jsx("h2",{className:"text-xl font-bold text-text mb-3",children:"Deluxe Gaming – Uy tín tạo niềm tin"}),a.jsx("p",{className:"text-text-muted max-w-lg mx-auto mb-6 text-sm",children:"Với chính sách bán hàng minh bạch, hỗ trợ nhanh chóng và đặt quyền lợi khách hàng lên hàng đầu, Deluxe Gaming cam kết mang đến:"}),a.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-text",children:[a.jsxs("span",{className:"flex items-center gap-2",children:[a.jsx(js,{className:"w-4 h-4 text-emerald-500"})," Trải nghiệm an toàn"]}),a.jsxs("span",{className:"flex items-center gap-2",children:[a.jsx(Sn,{className:"w-4 h-4 text-primary"})," Chính hãng 100%"]}),a.jsxs("span",{className:"flex items-center gap-2",children:[a.jsx(wm,{className:"w-4 h-4 text-indigo-500"})," Hỗ trợ chuyên nghiệp"]})]}),a.jsx("p",{className:"mt-6 text-text-muted text-sm italic",children:"Nếu bạn cần hỗ trợ, hãy liên hệ – chúng tôi luôn sẵn sàng đồng hành."})]})]})]})},Wte=()=>{const{t:e}=Pt(),t=ss(),n=xr(N=>N.wishlists),s=xr(N=>N.loading),i=xr(N=>N.error),l=xr(N=>N.fetchWishlist),c=xr(N=>N.removeFromWishlist);w.useEffect(()=>{l()},[l]);const d=w.useCallback(async(N,j)=>{j.stopPropagation();try{await c(N),Be.info(e("productDetail.removedFromWishlist"))}catch(_){console.error("Failed to remove item from wishlist:",_)}},[c,e]),f=w.useCallback(N=>{t(`/store/${N.slug||N.id}`)},[t]),m=w.useCallback(()=>{t("/store")},[t]),p=w.useMemo(()=>e("wishlistScreen.title"),[e]),g=w.useMemo(()=>e("wishlistScreen.subtitle"),[e]),y=w.useMemo(()=>e("wishlistScreen.empty"),[e]),S=w.useMemo(()=>e("wishlistScreen.emptyDesc"),[e]),v=w.useMemo(()=>e("wishlistScreen.exploreStore"),[e]);return a.jsxs("div",{className:"w-full space-y-6 animate-in fade-in duration-300",children:[a.jsx("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4",children:a.jsxs("div",{className:"space-y-1",children:[a.jsxs("h1",{className:"text-xl sm:text-2xl font-black text-text tracking-tight flex items-center gap-2.5",children:[a.jsx(ld,{className:"w-6 h-6 text-rose-500 fill-rose-500/20"}),a.jsx("span",{children:p}),n.length>0&&a.jsx("span",{className:"text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20",children:n.length})]}),a.jsx("p",{className:"text-xs sm:text-sm text-text-muted font-medium",children:g})]})}),s&&a.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5",children:Array.from({length:6}).map((N,j)=>a.jsxs("div",{className:"rounded-2xl bg-card/60 border border-border/60 p-3 space-y-3 animate-pulse",children:[a.jsx("div",{className:"w-full aspect-[4/5] rounded-xl bg-muted/60"}),a.jsx("div",{className:"h-4 bg-muted/60 rounded-md w-3/4"}),a.jsx("div",{className:"h-4 bg-muted/60 rounded-md w-1/2"})]},j))}),!s&&i&&a.jsxs("div",{className:"py-12 text-center space-y-4 bg-card/60 border border-border/60 rounded-3xl p-8 backdrop-blur-xl max-w-md mx-auto shadow-xl",children:[a.jsx("div",{className:"w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto",children:a.jsx(Un,{className:"w-7 h-7"})}),a.jsx("p",{className:"text-sm font-bold text-text-muted",children:i}),a.jsxs(Ue,{type:"button",onClick:()=>l(),className:"px-5 py-2 rounded-xl bg-primary text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer",children:[a.jsx(nr,{className:"w-4 h-4"}),a.jsx("span",{children:e("common.buttons.retry")})]})]}),!s&&!i&&n.length===0&&a.jsxs("div",{className:"py-20 text-center space-y-4 bg-card/60 border border-border/60 rounded-3xl p-8 backdrop-blur-xl max-w-md mx-auto shadow-xl",children:[a.jsx("div",{className:"w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-inner",children:a.jsx(ld,{className:"w-8 h-8"})}),a.jsxs("div",{className:"space-y-1",children:[a.jsx("h3",{className:"text-base sm:text-lg font-extrabold text-text",children:y}),a.jsx("p",{className:"text-xs text-text-muted max-w-sm mx-auto leading-relaxed",children:S})]}),a.jsx("div",{className:"pt-2",children:a.jsxs(Ue,{type:"button",onClick:m,className:"px-6 py-2.5 rounded-2xl bg-primary text-black font-extrabold text-xs shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer",children:[a.jsx(no,{className:"w-4 h-4"}),a.jsx("span",{children:v})]})})]}),!s&&!i&&n.length>0&&a.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5",children:n.map(N=>N.product?a.jsxs("div",{className:"relative group",children:[a.jsx(kp,{product:N.product,onClick:f}),a.jsx("button",{type:"button",onClick:j=>d(N.productId,j),title:e("wishlistScreen.removeTooltip"),className:"absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/70 hover:bg-rose-600 text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg z-10",children:a.jsx(Nm,{className:"w-3.5 h-3.5"})})]},N.id):null)})]})},Yte={fetcher:pI,revalidateOnFocus:!1,shouldRetryOnError:!1},Zte=()=>{const{t:e}=Pt();return a.jsxs("div",{className:"flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-2",children:[a.jsx("h2",{className:"text-xl font-bold text-text",children:e("sidebar.vietization")}),a.jsx("p",{className:"text-sm text-text-muted",children:e("common.comingSoon")})]})},Xte=()=>{const{isRestartModalOpen:e,isRestarting:t,handleRestartSteam:n,handleCloseModal:s}=OI(),{currentVersion:i,updateInfo:l,isModalOpen:c,handleDismiss:d}=zI();return a.jsx(_I,{children:a.jsx(gI,{children:a.jsx(FP,{value:Yte,children:a.jsxs(j6,{children:[a.jsx(YV,{}),a.jsx(cP,{richColors:!0,position:"top-center"}),a.jsx(HV,{isOpen:e,isRestarting:t,onConfirm:n,onClose:s}),a.jsx($V,{isOpen:c,currentVersion:i,updateInfo:l,onClose:d}),a.jsxs(JL,{children:[a.jsxs(wn,{path:"/",element:a.jsx(w7,{}),children:[a.jsx(wn,{index:!0,element:a.jsx(qu,{to:"/store",replace:!0})}),a.jsx(wn,{path:"store",element:a.jsx(qte,{})}),a.jsx(wn,{path:"store/all",element:a.jsx(Fte,{})}),a.jsx(wn,{path:"steam-offline",element:a.jsx(qu,{to:"/store/all",replace:!0})}),a.jsx(wn,{path:"steam-key",element:a.jsx(qu,{to:"/store/all",replace:!0})}),a.jsx(wn,{path:"store/:slug",element:a.jsx(Rte,{})}),a.jsx(wn,{path:"wishlist",element:a.jsx(Wte,{})}),a.jsx(wn,{path:"cart",element:a.jsx(l$,{})}),a.jsx(wn,{path:"library",element:a.jsx(cee,{})}),a.jsx(wn,{path:"denuvo-fix",element:a.jsx(pW,{})}),a.jsx(wn,{path:"orders",element:a.jsx(hee,{})}),a.jsx(wn,{path:"community",element:a.jsx(d$,{})}),a.jsx(wn,{path:"feedback",element:a.jsx(CW,{})}),a.jsx(wn,{path:"warranty",element:a.jsx(Kte,{})}),a.jsx(wn,{path:"privacy",element:a.jsx(fee,{})}),a.jsx(wn,{path:"terms",element:a.jsx(Gte,{})}),a.jsx(wn,{path:"vietization",element:a.jsx(Zte,{})}),a.jsx(wn,{path:"account",element:a.jsx(X7,{})}),a.jsx(wn,{path:"settings",element:a.jsx(Lte,{})})]}),a.jsxs(wn,{element:a.jsx(XV,{}),children:[a.jsx(wn,{path:"/login",element:a.jsx(dee,{})}),a.jsx(wn,{path:"/register",element:a.jsx(Mte,{})}),a.jsx(wn,{path:"/forgot-password",element:a.jsx(see,{})})]})]})]})})})})};dD.createRoot(document.getElementById("root")).render(a.jsx(_e.StrictMode,{children:a.jsx(Xte,{})}));
