import React from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const Navbar = ({ passwordArray }) => {

    const downloadPDF = () => {
        if (!passwordArray || passwordArray.length === 0) {
            alert("No passwords found to download!");
            return;
        }

        // 1. Ask for User Name (Optional)
        let userName = prompt("Please enter your name for the PDF header (Optional):");
        
        // Determine Heading text
        const headingText = userName && userName.trim() !== "" 
            ? `Password List of ${userName}` 
            : "Your Saved Passwords";

        // 2. Get Current Month and Year
        const date = new Date();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const lastEditedText = `Last Edited: ${month} ${year}`;

        const doc = new jsPDF();

        // 3. Add Personalized Heading
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text(headingText, 14, 20);
        
        // 4. Add "Last Edited" Header
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(lastEditedText, 14, 28);

        // 5. Prepare Table Data
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

        // 6. Generate Table
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
        <nav className='bg-slate-800 text-white relative'>
            <div className='mycontainer flex justify-between items-center h-14 py-0'>
                <div className="logo font-bold text-white text-2xl">
                    <span className='text-blue-200'> &lt;</span>
                    Pass
                    <span className='text-blue-200'> Saver/&gt;</span>
                </div>
                
                <button 
                    onClick={downloadPDF}
                    className='text-white bg-blue-500 my-5 rounded-md flex gap-4 justify-center items-center px-3 py-2 hover:bg-blue-400 cursor-pointer'>
                    <img className='invert w-8 h-8' src="public/file.png" alt="download_pdflogo" />
                    Download Pdf
                </button>
            </div>
        </nav>
    )
}

export default Navbar