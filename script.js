// 1. ນຳເຂົ້າ Firebase SDK ທີ່ຈຳເປັນ
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. ຕັ້ງຄ່າ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAZvZSKb9JQAwu6fbzbYxApudX3MwxRYss",
    authDomain: "my-school-c1104.firebaseapp.com",
    projectId: "my-school-c1104",
    storageBucket: "my-school-c1104.appspot.com",
    messagingSenderId: "339930418459",
    appId: "1:339930418459:web:3dd86db9d280c6cb0cd7be",
    measurementId: "G-NPNFSW2C72"
};

// 3. ເລີ່ມຕົ້ນ Firebase App ແລະ Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ຕົວແປເກັບຂໍ້ມູນນັກຮຽນສຳລັບການຄົ້ນຫາ
let allStudentsData = [];

// ==========================================
// 4. ຟັງຊັນຄວບຄຸມການສະຫຼັບໜ້າ (Sidebar Navigation)
// ==========================================
window.showSection = function(sectionName) {
    // ປິດການສະແດງຜົນທຸກ section ກ่อน
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => {
        sec.style.display = 'none';
    });

    // ເປີດສະແດງຜົນສະເພາະ section ທີ່ຖືກຄລິກ
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// ຟັງຊັນອອກຈາກລະບົບ (Logout)
window.logout = function() {
    localStorage.removeItem('isLoggedIn');
    alert('🚪 ອອກຈາກລະບົບສຳເລັດ!');
    window.location.href = 'index.html'; // ຫຼື ປັບຕາມໜ້າລັອກອິນຂອງທ່ານ
}

// ==========================================
// 5. ໂມດູນຈັດການນັກຮຽນ (Students Management)
// ==========================================

// 5.1 ໂຫຼດລາຍຊື່ນັກຮຽນຈາກ Firebase Firestore
window.loadStudents = async function() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px;">ກຳລັງໂຫຼດຂໍ້ມູນ...</td></tr>`;

    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        tbody.innerHTML = '';
        allStudentsData = [];

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px;">ຍັງບໍ່ມີຂໍ້ມູນນັກຮຽນໃນລະບົບ</td></tr>`;
            const dashStudents = document.getElementById('dash-total-students');
            if (dashStudents) dashStudents.innerText = '0 ຄົນ';
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            data.docId = documentSnapshot.id;
            allStudentsData.push(data);
        });

        // ອັບເດດຕົວເລກລວມໃນ Dashboard
        const dashStudents = document.getElementById('dash-total-students');
        if (dashStudents) dashStudents.innerText = allStudentsData.length + ' ຄົນ';

        renderStudentsTable(allStudentsData);
    } catch (error) {
        console.error("Error loading students: ", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px; color: red;">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</td></tr>`;
    }
}

// 5.2 ສະແດງຜົນລົງໃນຕາຕະລາງ HTML
function renderStudentsTable(students) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px;">ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ</td></tr>`;
        return;
    }

    students.forEach((student) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${student.id || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${student.name || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${student.grade || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                <button onclick="editStudent('${student.docId}', '${student.id}', '${student.name}', '${student.grade}')" style="background: #ffc107; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️ ແກ້ໄຂ</button>
                <button onclick="deleteStudent('${student.docId}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️ ລົບ</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 5.3 ຈັດການການສົ່ງຟອມ (ເພີ່ມ ຫຼື ອັບເດດຂໍ້ມູນນັກຮຽນ)
const studentForm = document.getElementById('student-form');
if (studentForm) {
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('student-doc-id').value;
        const studentId = document.getElementById('student-id').value;
        const name = document.getElementById('student-name').value;
        const grade = document.getElementById('student-grade').value;

        try {
            if (docId) {
                // ອັບເດດຂໍ້ມູນທີ່ມີຢູ່ແລ້ວ
                await updateDoc(doc(db, "students", docId), { id: studentId, name: name, grade: grade });
                alert('✅ ແກ້ໄຂຂໍ້ມູນສຳເລັດ!');
            } else {
                // ເພີ່ມຂໍ້ມູນໃຫມ່
                await addDoc(collection(db, "students"), { id: studentId, name: name, grade: grade });
                alert('✅ ເພີ່ມນັກຮຽນສຳເລັດ!');
            }
            window.resetStudentForm();
            window.loadStudents();
        } catch (error) {
            console.error("Error saving student: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດ: ' + error.message);
        }
    });
}

// 5.4 ນຳຂໍ້ມູນມາໃສ່ຟອມເພື່ອແກ້ໄຂ
window.editStudent = function(docId, id, name, grade) {
    document.getElementById('student-doc-id').value = docId;
    document.getElementById('student-id').value = id;
    document.getElementById('student-name').value = name;
    document.getElementById('student-grade').value = grade;
    
    document.getElementById('student-form-title').innerText = '✏️ ແກ້ໄຂຂໍ້ມູນນັກຮຽນ';
    document.getElementById('save-student-btn').innerText = 'ອັບເດດຂໍ້ມູນ';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
}

// 5.5 ລົບຂໍ້ມູນນັກຮຽນ
window.deleteStudent = async function(docId) {
    if (confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນັກຮຽນນີ້ແທ້ບໍ?')) {
        try {
            await deleteDoc(doc(db, "students", docId));
            alert('✅ ລົບຂໍ້ມູນສຳເລັດ!');
            window.loadStudents();
        } catch (error) {
            console.error("Error deleting student: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດໃນການລົບ');
        }
    }
}

// 5.6 ຣີເຊັດຟອມກຣອກຂໍ້ມູນ
window.resetStudentForm = function() {
    const form = document.getElementById('student-form');
    if (form) form.reset();
    document.getElementById('student-doc-id').value = '';
    document.getElementById('student-form-title').innerText = '➕ ເພີ່ມຂໍ້ມູນນັກຮຽນໃໝ່';
    document.getElementById('save-student-btn').innerText = 'ບັນທຶກຂໍ້ມູນ';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

// 5.7 ຟັງຊັນຄົ້ນຫານັກຮຽນໃນຕາຕະລາງ
window.filterStudents = function() {
    const inputSearch = document.getElementById('search-student-input');
    if (!inputSearch) return;
    const keyword = inputSearch.value.toLowerCase();
    
    const filtered = allStudentsData.filter(s => 
        (s.name && s.name.toLowerCase().includes(keyword)) || 
        (s.id && s.id.toLowerCase().includes(keyword)) ||
        (s.grade && s.grade.toLowerCase().includes(keyword))
    );
    renderStudentsTable(filtered);
}

// ==========================================
// 6. ໂຫຼດຂໍ້ມູນເລີ່ມຕົ້ນເມື່ອເປີດໜ້າເວັບ
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    window.loadStudents();
});
