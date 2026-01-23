import React from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const Navbar = ({ passwordArray }) => {

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
        <nav className='bg-slate-800 text-white relative w-full'>
            <div className='mycontainer flex justify-between items-center min-h-14 py-2 sm:py-0'>
                <div className="logo font-bold text-white text-xl sm:text-2xl flex-shrink-0">
                    <span className='text-blue-200'> &lt;</span>
                    Pass
                    <span className='text-blue-200'> Saver/&gt;</span>
                </div>
                
                <button 
                    onClick={downloadPDF}
                    className='text-white bg-blue-500 rounded-md flex gap-2 justify-center items-center px-3 py-1.5 sm:py-2 hover:bg-blue-400 cursor-pointer transition-all active:scale-95'>
                    <img className='invert w-5 h-5 sm:w-7 sm:h-7' src="/file.png" alt="download_pdflogo" />
                    <span className='text-sm sm:text-base font-bold'>
                        <span className='hidden md:inline'>Download </span>
                        PDF
                    </span>
                </button>
            </div>
        </nav>
    )
}

export default Navbar