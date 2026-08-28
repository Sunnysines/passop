import React from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const Navbar = ({ passwordArray, user, onOpenAuth, onLogout }) => {

    const downloadPDF = () => {
        if (!passwordArray || passwordArray.length === 0) {
            alert("No passwords found to download!");
            return;
        }

        let userName = prompt("Please enter your name for the PDF header (Optional):");
        
        const headingText = userName && userName.trim() !== "" 
            ? `Password List of ${userName}` 
            : "Your Saved Passwords";

        const date = new Date();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const lastEditedText = `Last Edited: ${month} ${year}`;

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text(headingText, 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(lastEditedText, 14, 28);

        const tableColumn = ["Website", "Email", "Username", "Password"];
        const tableRows = [];

        passwordArray.forEach(item => {
            const rowData = [
                item.name || item.site,
                item.email || "NULL",
                item.username,
                item.password
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }, // slate-800
            styles: { fontSize: 10 }
        });

        doc.save(`${userName ? userName + "_" : ""}Passwords.pdf`);
    }

    return (
        /* Changed to 'relative' so it stays at the top and scrolls away with the page */
        <nav className='bg-slate-800 text-white relative w-full shadow-sm'>
            <div className='mycontainer flex justify-between items-center min-h-14 py-2.5 sm:py-2'>
                <div className="logo font-bold text-white text-xl sm:text-2xl flex-shrink-0">
                    <span className='text-blue-200'> &lt;</span>
                    Pass
                    <span className='text-blue-200'> Saver/&gt;</span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* User Auth Buttons / Profile on the right */}
                    {!user ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => onOpenAuth('login')}
                                className="text-white hover:text-blue-200 font-semibold px-2.5 py-1 sm:py-1.5 rounded-md hover:bg-slate-700/60 cursor-pointer transition text-xs sm:text-sm"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => onOpenAuth('signup')}
                                className="text-white bg-blue-600 hover:bg-blue-500 font-semibold px-3 py-1 sm:py-1.5 rounded-md cursor-pointer transition active:scale-95 text-xs sm:text-sm"
                            >
                                Sign Up
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden sm:flex items-center gap-2 bg-slate-700/70 px-3 py-1 rounded-full border border-slate-600/80 text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="truncate max-w-[130px] md:max-w-[180px] text-slate-200">{user.email}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="text-slate-300 hover:text-rose-400 font-semibold px-2 py-1 rounded hover:bg-slate-700/50 cursor-pointer transition text-xs sm:text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={downloadPDF}
                        className='text-white bg-blue-500 rounded-md flex gap-1.5 sm:gap-2 justify-center items-center px-2.5 sm:px-3 py-1 sm:py-1.5 hover:bg-blue-400 cursor-pointer transition-all active:scale-95'>
                        <img className='invert w-4 h-4 sm:w-6 sm:h-6' src="/file.png" alt="download_pdflogo" />
                        <span className='text-xs sm:text-sm font-bold'>
                            <span className='hidden md:inline'>Download </span>
                            PDF
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar