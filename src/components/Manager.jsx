import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { Copy, Check, Pencil, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Manager = ({ passwordArray, setpasswordArray }) => {
    const Passwordref = useRef();
    const ref = useRef();

    const [form, setForm] = useState({ name: "", email: "", site: "", username: "", password: "" })
    const [showPasswordState, setShowPasswordState] = useState(false)
    const [visiblePasswords, setVisiblePasswords] = useState({});
    
    // State to track the copy icon switch for each field individually
    const [copyStatus, setCopyStatus] = useState({ id: null, field: null });

    const notify = (msg, type = "success") => {
        toast[type](msg, {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
            style: type === "success" ? { backgroundColor: "#3b82f6" } : { backgroundColor: "#ef4444" }
        });
    }

    const toggleTablePassword = (id) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const showPassword = () => {
        setShowPasswordState(!showPasswordState)
    }

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let retVal = "";
        for (let i = 0; i < 14; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setForm({ ...form, password: retVal });
        notify("New Password Generated!");
    }

    const Savepassword = () => {
        if (form.site.length === 0 || form.username.length === 0 || form.password.length === 0) {
            notify("Required fields are empty!", "error");
            return;
        }

        const isEdit = !!form.id;
        const newEntry = form.id ? form : { ...form, id: uuidv4() };
        let passwords = JSON.parse(localStorage.getItem("passwords")) || [];
        const updatedArray = [...passwords.filter(item => item.id !== newEntry.id), newEntry];

        setpasswordArray(updatedArray);
        localStorage.setItem("passwords", JSON.stringify(updatedArray));
        setForm({ name: "", email: "", site: "", username: "", password: "" });
        setShowPasswordState(false);
        notify(isEdit ? "Password Updated Successfully!" : "Password Saved Successfully!");
    }

    const deletePassword = (id) => {
        if (window.confirm("Do you really want to delete this password?")) {
            const updatedArray = passwordArray.filter(item => item.id !== id);
            setpasswordArray(updatedArray);
            localStorage.setItem("passwords", JSON.stringify(updatedArray));
            notify("Password Deleted Successfully!");
        }
    }

    const editPassword = (id) => {
        let passwords = JSON.parse(localStorage.getItem("passwords")) || [];
        const itemToEdit = passwords.find(i => i.id === id);
        setForm(itemToEdit);
        setpasswordArray(passwords.filter(item => item.id !== id));
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const copyText = (text, id, field) => {
        navigator.clipboard.writeText(text);
        setCopyStatus({ id, field });
        setTimeout(() => {
            setCopyStatus({ id: null, field: null });
        }, 1000);
        notify("Copied to Clipboard!");
    }

    return (
        <>
            <ToastContainer />
            <div className="fixed inset-0 -z-10 min-h-screen w-full bg-blue-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-30 blur-[100px]"></div>
            </div>

            <div className="mycontainer min-h-[85vh] py-10 flex flex-col">
                <h1 className='text-4xl font-bold text-center'>
                    <span className='text-blue-500'> &lt;</span> Pass <span className='text-blue-500'> Saver/&gt;</span>
                </h1>
                <p className='text-blue-900 text-lg text-center mb-8'>Your own Password Manager</p>

                <div className="flex flex-col p-4 text-black gap-5 items-center">
                    <div className="flex w-full gap-5">
                        <input value={form.name} onChange={handleChange} placeholder='Website Name (Optional)' type="text" className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="name" />
                        <input value={form.email} onChange={handleChange} placeholder='Associated Email (Optional)' type="text" className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="email" />
                    </div>

                    <input value={form.site} onChange={handleChange} placeholder='Enter Website Url *' type="text" className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="site" />

                    <div className="flex w-full justify-between gap-8">
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username *' type="text" className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full" name="username" />
                        <div className='relative w-full'>
                            <input ref={Passwordref} value={form.password} onChange={handleChange} placeholder='Enter Password *' type={showPasswordState ? "text" : "password"} className="rounded-full bg-white px-4 py-1 border border-blue-500 w-full pr-20" name="password" />
                            <div className='absolute right-2 top-1 flex gap-2'>
                                <span className='cursor-pointer p-1' onClick={generatePassword} title="Generate Password">
                                    <RefreshCw size={20} className="text-blue-500 hover:rotate-180 transition-all duration-500" />
                                </span>
                                <span className='cursor-pointer p-1' onClick={showPassword} >
                                    <img ref={ref} width={20} src={showPasswordState ? "/public/hidden.png" : "/public/eye.png"} alt="eye" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <button onClick={Savepassword} className='flex justify-center min-w-32 items-center gap-2 bg-blue-400 rounded-full hover:bg-blue-300 px-8 py-2 w-fit border border-blue-900 font-bold'>
                        <lord-icon src="https://cdn.lordicon.com/efxgwrkc.json" trigger="hover" style={{ width: "20px", height: "20px" }}></lord-icon>
                        {form.id ? "Update" : "Save"}
                    </button>
                </div>

                <div className="passwords px-4 flex-grow">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    {(passwordArray.length === 0 && !form.id) && <p className='text-gray-500 text-center'>No passwords to show.</p>}
                    {(passwordArray.length !== 0 || form.id) && <table className="table-auto w-full rounded-md overflow-hidden mb-10">
                        <thead className=' bg-blue-800 text-white'>
                            <tr>
                                <th className='py-2'>Site</th>
                                <th className='py-2'>Linked Email</th>
                                <th className='py-2'>Username</th>
                                <th className='py-2'>Password</th>
                                <th className='py-2'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='bg-blue-100'>
                            {passwordArray.map((item) => (
                                <tr key={item.id}>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <a href={item.site} target='_blank' rel="noreferrer" className="underline">{item.name || item.site}</a>
                                            <div className='cursor-pointer' onClick={() => copyText(item.site, item.id, 'site')}>
                                                {copyStatus.id === item.id && copyStatus.field === 'site' ? <Check size={14} color="green" /> : <Copy size={14} />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center gap-2'>
                                            {item.email || "NULL"}
                                            <div className='cursor-pointer' onClick={() => copyText(item.email || "NULL", item.id, 'email')}>
                                                {copyStatus.id === item.id && copyStatus.field === 'email' ? <Check size={14} color="green" /> : <Copy size={14} />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center gap-2'>
                                            {item.username}
                                            <div className='cursor-pointer' onClick={() => copyText(item.username, item.id, 'user')}>
                                                {copyStatus.id === item.id && copyStatus.field === 'user' ? <Check size={14} color="green" /> : <Copy size={14} />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <span className='font-mono'>{visiblePasswords[item.id] ? item.password : "••••••••"}</span>
                                            <div className='flex gap-2'>
                                                <div className='cursor-pointer' onClick={() => toggleTablePassword(item.id)}>
                                                    {visiblePasswords[item.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </div>
                                                <div className='cursor-pointer' onClick={() => copyText(item.password, item.id, 'pass')}>
                                                    {copyStatus.id === item.id && copyStatus.field === 'pass' ? <Check size={14} color="green" /> : <Copy size={14} />}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center gap-4'>
                                            <span className='cursor-pointer' onClick={() => editPassword(item.id)}><Pencil size={18} /></span>
                                            <span className='cursor-pointer' onClick={() => deletePassword(item.id)}><Trash2 size={18} /></span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}
                </div>
            </div>
        </>
    )
}

export default Manager