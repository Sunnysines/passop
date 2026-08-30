import React, { useRef, useState } from 'react'
import { Copy, Check, Pencil, Trash2, Eye, EyeOff, RefreshCw, Database, Cloud } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid';

const Manager = ({ passwordArray, setpasswordArray, user, token, onOpenAuth, notify, isLoading }) => {
    const Passwordref = useRef();
    const ref = useRef();

    const [form, setForm] = useState({ name: "", email: "", site: "", username: "", password: "" })
    const [showPasswordState, setShowPasswordState] = useState(false)
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [copyStatus, setCopyStatus] = useState({ id: null, field: null });
    const [isSaving, setIsSaving] = useState(false);

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
        notify?.("New Password Generated!");
    }

    const Savepassword = async () => {
        if (form.site.length === 0 || form.username.length === 0 || form.password.length === 0) {
            notify?.("Required fields are empty!", "error");
            return;
        }

        const isEdit = !!form.id;
        const entryId = form.id || uuidv4();
        const entryData = { ...form, id: entryId };

        setIsSaving(true);

        // If authenticated, persist to MongoDB backend
        if (token) {
            try {
                const res = await fetch('/api/passwords', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(entryData)
                });
                const data = await res.json();

                if (data.success) {
                    const exists = passwordArray.some(item => item.id === entryId);
                    const updatedArray = exists 
                        ? passwordArray.map(item => item.id === entryId ? entryData : item)
                        : [entryData, ...passwordArray];
                    
                    setpasswordArray(updatedArray);
                    localStorage.setItem("passwords", JSON.stringify(updatedArray));
                    setForm({ name: "", email: "", site: "", username: "", password: "" });
                    setShowPasswordState(false);
                    notify?.(isEdit ? "Password Updated in MongoDB!" : "Password Saved to MongoDB!");
                    setIsSaving(false);
                    return;
                } else {
                    notify?.(data.message || "Failed to save password in MongoDB", "error");
                }
            } catch (err) {
                console.error("Error saving to MongoDB:", err);
                notify?.("Could not reach backend database. Saving locally...", "error");
            }
        }

        // Local Storage fallback for guest mode
        let passwords = JSON.parse(localStorage.getItem("passwords")) || [];
        const exists = passwords.some(item => item.id === entryId);
        const updatedArray = exists
            ? passwords.map(item => item.id === entryId ? entryData : item)
            : [entryData, ...passwords];

        setpasswordArray(updatedArray);
        localStorage.setItem("passwords", JSON.stringify(updatedArray));
        setForm({ name: "", email: "", site: "", username: "", password: "" });
        setShowPasswordState(false);
        setIsSaving(false);
        notify?.(isEdit ? "Password Updated Locally!" : (user ? "Password Saved Locally!" : "Saved locally. Login to sync with MongoDB!"));
    }

    const deletePassword = async (id) => {
        if (window.confirm("Do you really want to delete this password?")) {
            if (token) {
                try {
                    const res = await fetch(`/api/passwords/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await res.json();
                    if (!data.success) {
                        notify?.(data.message || "Failed to delete from MongoDB", "error");
                    }
                } catch (err) {
                    console.error("Error deleting from MongoDB:", err);
                }
            }

            const updatedArray = passwordArray.filter(item => item.id !== id);
            setpasswordArray(updatedArray);
            localStorage.setItem("passwords", JSON.stringify(updatedArray));
            notify?.("Password Deleted Successfully!");
        }
    }

    const editPassword = (id) => {
        const itemToEdit = passwordArray.find(i => i.id === id);
        if (itemToEdit) {
            setForm(itemToEdit);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
        notify?.("Copied to Clipboard!");
    }

    return (
        <>
            <div className="fixed inset-0 -z-10 min-h-screen w-full bg-blue-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-30 blur-[100px]"></div>
            </div>

            <div className="mycontainer min-h-[89vh] py-10 flex flex-col items-center">
                <h1 className='text-4xl font-bold text-center'>
                    <span className='text-blue-500'> &lt;</span> Pass <span className='text-blue-500'> Saver/&gt;</span>
                </h1>
                <p className='text-blue-900 text-lg text-center mb-4'>Your own Password Manager</p>

                {/* Storage Mode Pill Indicator */}
                <div className="mb-4 flex items-center gap-2 px-3 py-1 bg-white/80 border border-blue-200 rounded-full shadow-xs text-xs font-medium text-slate-700">
                    {user ? (
                        <>
                            <Database size={14} className="text-emerald-600" />
                            <span>Connected to <strong className="text-emerald-700">MongoDB Cloud</strong></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </>
                    ) : (
                        <>
                            <Cloud size={14} className="text-blue-600" />
                            <span>Storage: <strong>Local Storage</strong></span>
                            <button 
                                onClick={() => onOpenAuth?.('login')}
                                className="text-blue-600 underline font-semibold ml-1 cursor-pointer hover:text-blue-800"
                            >
                                Login to sync with MongoDB
                            </button>
                        </>
                    )}
                </div>

                <div className="flex flex-col p-4 text-black gap-5 items-center w-full">
                    {/* Responsive inputs: stack on mobile, row on desktop */}
                    <div className="flex flex-col md:flex-row w-full gap-5">
                        <input value={form.name} onChange={handleChange} placeholder='Website Name (Optional)' type="text" className="rounded-full bg-white px-4 py-1.5 border border-blue-500 w-full outline-none focus:ring-2 focus:ring-blue-200" name="name" />
                        <input value={form.email} onChange={handleChange} placeholder='Associated Email (Optional)' type="text" className="rounded-full bg-white px-4 py-1.5 border border-blue-500 w-full outline-none focus:ring-2 focus:ring-blue-200" name="email" />
                    </div>

                    <input value={form.site} onChange={handleChange} placeholder='Enter Website Url *' type="text" className="rounded-full bg-white px-4 py-1.5 border border-blue-500 w-full outline-none focus:ring-2 focus:ring-blue-200" name="site" />

                    <div className="flex flex-col md:flex-row w-full justify-between gap-5 md:gap-8">
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username *' type="text" className="rounded-full bg-white px-4 py-1.5 border border-blue-500 w-full outline-none focus:ring-2 focus:ring-blue-200" name="username" />
                        <div className='relative w-full'>
                            <input ref={Passwordref} value={form.password} onChange={handleChange} placeholder='Enter Password *' type={showPasswordState ? "text" : "password"} className="rounded-full bg-white px-4 py-1.5 border border-blue-500 w-full pr-20 outline-none focus:ring-2 focus:ring-blue-200" name="password" />
                            <div className='absolute right-2 top-1.5 flex gap-2'>
                                <span className='cursor-pointer p-1' onClick={generatePassword} title="Generate Password">
                                    <RefreshCw size={20} className="text-blue-500 hover:rotate-180 transition-all duration-500" />
                                </span>
                                <span className='cursor-pointer p-1' onClick={showPassword} >
                                    <img ref={ref} width={20} src={showPasswordState ? "/hidden.png" : "/eye.png"} alt="eye" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={Savepassword} 
                            disabled={isSaving}
                            className='flex justify-center min-w-32 items-center gap-2 bg-blue-400 rounded-full hover:bg-blue-300 px-8 py-2 w-fit border border-blue-900 font-bold cursor-pointer transition active:scale-95 disabled:opacity-70'
                        >
                            <lord-icon src="https://cdn.lordicon.com/efxgwrkc.json" trigger="hover" style={{ width: "20px", height: "20px" }}></lord-icon>
                            {isSaving ? "Saving..." : (form.id ? "Update" : "Save")}
                        </button>
                        {form.id && (
                            <button 
                                onClick={() => {
                                    setForm({ name: "", email: "", site: "", username: "", password: "" });
                                    setShowPasswordState(false);
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full px-5 py-2 font-semibold text-sm cursor-pointer transition active:scale-95 border border-slate-300"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="passwords px-4 flex-grow w-full">
                    <div className="flex justify-between items-center py-4">
                        <h2 className='font-bold text-2xl'>Your Passwords</h2>
                        {user && (
                            <span className="text-xs text-slate-500 font-medium">
                                Synced with MongoDB for <strong className="text-slate-700">{user.email}</strong>
                            </span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="py-8 text-center text-blue-600 font-medium animate-pulse">
                            Loading passwords from MongoDB...
                        </div>
                    ) : (passwordArray.length === 0 && !form.id) ? (
                        <p className='text-gray-500 text-center py-6'>No passwords to show.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border border-white shadow-xs">
                            <table className="table-auto w-full overflow-hidden mb-10 min-w-[600px]">
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
                                                <div className='flex items-center justify-center gap-2 px-2'>
                                                    <a href={item.site} target='_blank' rel="noreferrer" className="underline truncate max-w-[150px]">{item.name || item.site}</a>
                                                    <div className='cursor-pointer flex-shrink-0' onClick={() => copyText(item.site, item.id, 'site')}>
                                                        {copyStatus.id === item.id && copyStatus.field === 'site' ? <Check size={14} color="green" /> : <Copy size={14} />}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-2 border border-white text-center'>
                                                <div className='flex items-center justify-center gap-2 px-2'>
                                                    <span className="truncate max-w-[150px]">{item.email || "NULL"}</span>
                                                    <div className='cursor-pointer flex-shrink-0' onClick={() => copyText(item.email || "NULL", item.id, 'email')}>
                                                        {copyStatus.id === item.id && copyStatus.field === 'email' ? <Check size={14} color="green" /> : <Copy size={14} />}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-2 border border-white text-center'>
                                                <div className='flex items-center justify-center gap-2 px-2'>
                                                    <span className="truncate max-w-[150px]">{item.username}</span>
                                                    <div className='cursor-pointer flex-shrink-0' onClick={() => copyText(item.username, item.id, 'user')}>
                                                        {copyStatus.id === item.id && copyStatus.field === 'user' ? <Check size={14} color="green" /> : <Copy size={14} />}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-2 border border-white text-center'>
                                                <div className='flex items-center justify-center gap-2 px-2'>
                                                    <span className='font-mono'>{visiblePasswords[item.id] ? item.password : "••••••••"}</span>
                                                    <div className='flex gap-2 flex-shrink-0'>
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
                                                <div className='flex items-center justify-center gap-4 px-2'>
                                                    <span className='cursor-pointer' onClick={() => editPassword(item.id)}><Pencil size={18} /></span>
                                                    <span className='cursor-pointer' onClick={() => deletePassword(item.id)}><Trash2 size={18} /></span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Manager