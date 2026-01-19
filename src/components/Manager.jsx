import React from 'react'
import { useRef, useState, useEffect} from 'react'
const Manager = () => {
    const ref = useRef();
    const [form, setForm] = useState({site: "", username: "", password: ""})
    const [passwordArray, setpasswordArray] = useState([])

    useEffect(() => {
        let passwords = localStorage.getItem("passwords");
        let passwordsArray;
        if (passwords) {
            setpasswordArray(JSON.parse(passwords));
        }
    }, [])

    

    const showPassword = () => {
        alert('Show Password clicked');
        if(ref.current.src.includes("public/hidden.png")){
            ref.current.src = "public/eye.png"
        }
        else{
            ref.current.src = "public/hidden.png"
        }
        

    }
    const Savepassword = () => {
        setpasswordArray([...passwordArray, form]);
        localStorage.setItem("passwords", JSON.stringify([...passwordArray, form]));
        console.log(...passwordArray, form);

    }
    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }   
    return (
        <>
            <div className="absolute inset-0 -z-10 h-full w-full bg-blue-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div></div>
            <div className="mycontainer">
                <h1 className='text-4xl text font-bold text-center'><span className='text-blue-500'> &lt;</span>
                    Pass
                    <span className='text-blue-500'> Saver/&gt;</span></h1>
                <p className='text-blue-900 text-lg text-center'>Your own Password Manager</p>
                <div className="fill-white flex flex-col p-4 text-black gap-8 items-center">
                    <input value={form.site} onChange={handleChange} placeholder='Enter Website Url' type="text" className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="site" id="" />
                    <div className="flex w-full justify-between gap-8">
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username' type="text" className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="username" id="" />
                        <div className='relative'>

                        <input value={form.password} onChange={handleChange} placeholder='Enter Password' type="text" className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="password" id="" />
                        <span className='absolute right-[3px] top-[4px] cursor-pointer' onClick={showPassword} >
                            <img ref={ref} className='p-1' width={26} src="\public\eye.png" alt="eye" />
                        </span>
                        </div>
                    </div>

                        <button onClick={Savepassword} className='flex justify-center items-center gap-2 bg-blue-400 rounded-full hover:bg-blue-300 px-8 py-2 w-fit border border-green-900'>
                        <lord-icon
                            src="https://cdn.lordicon.com/efxgwrkc.json"
                            trigger="hover">
                        </lord-icon>   
                            
                        Save</button>
                </div>
            </div>


        </>

    )
}

export default Manager
