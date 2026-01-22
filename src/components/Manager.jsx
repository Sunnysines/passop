import React from 'react'
import { useRef, useState, useEffect} from 'react'
const Manager = () => {
 
    const Passwordref = useRef();
    const ref = useRef();
    
    const [form, setForm] = useState({site: "", username: "", password: ""})
    const [passwordArray, setpasswordArray] = useState([])


    const [showPasswordState, setShowPasswordState] = useState(false)

    useEffect(() => {
        let passwords = localStorage.getItem("passwords");
        if (passwords) {
            setpasswordArray(JSON.parse(passwords));
        }
    }, [])


    const showPassword = () => {
        setShowPasswordState(!showPasswordState)
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
            <div className="absolute inset-0 -z-10 h-full w-full bg-blue-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]">
                </div>
            </div>
            <div className="mycontainer">
                <h1 className='text-4xl text font-bold text-center min-w-32'><span className='text-blue-500'> &lt;</span>
                    Pass
                    <span className='text-blue-500'> Saver/&gt;</span></h1>
                <p className='text-blue-900 text-lg text-center min-w-32'>Your own Password Manager</p>
                <div className="fill-white flex flex-col p-4 text-black gap-8 items-center min-w-32">
                    <input value={form.site} onChange={handleChange} placeholder='Enter Website Url' type="text" className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="site" id="" />
                    <div className="flex w-full justify-between gap-8">
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username' type="text" className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="username" id="" />
                        <div className='relative'>

                        
                        <input ref={Passwordref} value={form.password} onChange={handleChange} placeholder='Enter Password' type={showPasswordState ? "text" : "password"} className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="password" id="" />
                        
                        <span className='absolute right-[3px] top-[4px] cursor-pointer' onClick={showPassword} >
                            
                            <img ref={ref} className='p-1' width={26} src={showPasswordState ? "/public/hidden.png" : "/public/eye.png"} alt="eye" />
                        </span>
                        </div>
                    </div>

                        <button onClick={Savepassword} className='flex justify-center min-w-32 items-center min-w-32 gap-2 bg-blue-400 rounded-full hover:bg-blue-300 px-8 py-2 w-fit border border-green-900'>
                        <lord-icon
                            src="https://cdn.lordicon.com/efxgwrkc.json"
                            trigger="hover">
                        </lord-icon>   
                            
                            Save</button>
                </div>
                <div className="passwords">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    {passwordArray.length === 0 && <p className='text-gray-500'>No passwords to show.</p>}
                    {passwordArray.length != 0 &&<table className="table-auto w-full rounded-md overflow-hidden">
                        <thead className=' bg-blue-800 text-white'>
                            <tr>
                                <th className='py-2'>Site</th>
                                <th className='py-2'>Username</th>
                                <th className='py-2'>Password</th>
                            </tr>
                        </thead>
                        <tbody className='bg-blue-100'>
                            {passwordArray.map((item, index) => {
                                return <tr key={index}>
                                <td className='py-2 border border-white text-center min-w-32'><a href={item.site} target=''>{item.site}</a></td>
                                <td className='py-2 border border-white text-center min-w-32'>{item.username}</td>
                                <td className='py-2 border border-white text-center min-w-32'>{item.password}</td>
                            </tr>
                            })}
                        </tbody>
                    </table>}
                </div>
            </div>
        </>
    )
}

export default Manager