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
// ເກັບຂໍ້ມູນຄູທັງໝົດສຳລັບການຄົ້ນຫາ
let allTeachersData = [];

// 1. ໂຫຼດລາຍຊື່ຄູຈາກ Firebase Firestore
window.loadTeachers = async function() {
    const tbody = document.getElementById('teachers-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px;">ກຳລັງໂຫຼດຂໍ້ມູນ...</td></tr>`;

    try {
        const querySnapshot = await getDocs(collection(db, "teachers"));
        tbody.innerHTML = '';
        allTeachersData = [];

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px;">ຍັງບໍ່ມີຂໍ້ມູນຄູອາຈານໃນລະບົບ</td></tr>`;
            const dashTeachers = document.getElementById('dash-total-teachers');
            if (dashTeachers) dashTeachers.innerText = '0 ຄົນ';
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            data.docId = documentSnapshot.id;
            allTeachersData.push(data);
        });

        // ອັບເດດຕົວເລກລວມໃນ Dashboard
        const dashTeachers = document.getElementById('dash-total-teachers');
        if (dashTeachers) dashTeachers.innerText = allTeachersData.length + ' ຄົນ';

        renderTeachersTable(allTeachersData);
    } catch (error) {
        console.error("Error loading teachers: ", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px; color: red;">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</td></tr>`;
    }
}

// 2. ສະແດງຜົນລົງຕາຕະລາງ HTML
function renderTeachersTable(teachers) {
    const tbody = document.getElementById('teachers-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (teachers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px;">ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ</td></tr>`;
        return;
    }

    teachers.forEach((teacher) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${teacher.id || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${teacher.name || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${teacher.subject || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                <button onclick="editTeacher('${teacher.docId}', '${teacher.id}', '${teacher.name}', '${teacher.subject}')" style="background: #ffc107; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️ ແກ້ໄຂ</button>
                <button onclick="deleteTeacher('${teacher.docId}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️ ລົບ</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. ຈັດການການສົ່ງຟອມ (ເພີ່ມ ຫຼື ອັບເດດຂໍ້ມູນຄູ)
const teacherForm = document.getElementById('teacher-form');
if (teacherForm) {
    teacherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('teacher-doc-id').value;
        const teacherId = document.getElementById('teacher-id').value;
        const name = document.getElementById('teacher-name').value;
        const subject = document.getElementById('teacher-subject').value;

        try {
            if (docId) {
                // ອັບເດດຂໍ້ມູນທີ່ມີຢູ່ແລ້ວ
                await updateDoc(doc(db, "teachers", docId), { id: teacherId, name: name, subject: subject });
                alert('✅ ແກ້ໄຂຂໍ້ມູນຄູສຳເລັດ!');
            } else {
                // ເພີ່ມຂໍ້ມູນໃໝ່
                await addDoc(collection(db, "teachers"), { id: teacherId, name: name, subject: subject });
                alert('✅ ເພີ່ມຄູອາຈານສຳເລັດ!');
            }
            window.resetTeacherForm();
            window.loadTeachers();
        } catch (error) {
            console.error("Error saving teacher: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດ: ' + error.message);
        }
    });
}

// 4. ນຳຂໍ້ມູນມາໃສ່ຟອມເພື່ອແກ້ໄຂ
window.editTeacher = function(docId, id, name, subject) {
    document.getElementById('teacher-doc-id').value = docId;
    document.getElementById('teacher-id').value = id;
    document.getElementById('teacher-name').value = name;
    document.getElementById('teacher-subject').value = subject;
    
    document.getElementById('teacher-form-title').innerText = '✏️ ແກ້ໄຂຂໍ້ມູນຄູອາຈານ';
    document.getElementById('save-teacher-btn').innerText = 'ອັບເດດຂໍ້ມູນ';
    document.getElementById('cancel-teacher-edit-btn').style.display = 'inline-block';
}

// 5. ລົບຂໍ້ມູນຄູ
window.deleteTeacher = async function(docId) {
    if (confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນຄູອາຈານຄົນນີ້ແທ້ບໍ?')) {
        try {
            await deleteDoc(doc(db, "teachers", docId));
            alert('✅ ລົບຂໍ້ມູນສຳເລັດ!');
            window.loadTeachers();
        } catch (error) {
            console.error("Error deleting teacher: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດໃນການລົບ');
        }
    }
}

// 6. ຣີເຊັດຟອມກຣອກຂໍ້ມູນຄູ
window.resetTeacherForm = function() {
    const form = document.getElementById('teacher-form');
    if (form) form.reset();
    document.getElementById('teacher-doc-id').value = '';
    document.getElementById('teacher-form-title').innerText = '➕ ເเพີ່ມຂໍ້ມູນຄູອາຈານໃໝ່';
    document.getElementById('save-teacher-btn').innerText = 'ບັນທຶກຂໍ້ມູນ';
    document.getElementById('cancel-teacher-edit-btn').style.display = 'none';
}

// 7. ຟັງຊັນຄົ້ນຫາຄູໃນຕາຕະລາງ
window.filterTeachers = function() {
    const inputSearch = document.getElementById('search-teacher-input');
    if (!inputSearch) return;
    const keyword = inputSearch.value.toLowerCase();
    
    const filtered = allTeachersData.filter(t => 
        (t.name && t.name.toLowerCase().includes(keyword)) || 
        (t.id && t.id.toLowerCase().includes(keyword)) ||
        (t.subject && t.subject.toLowerCase().includes(keyword))
    );
    renderTeachersTable(filtered);
}

// ເອີ້ນໃຊ້ຟັງຊັນໂຫຼດຂໍ້ມູນຄູຕອນເປີດໜ້າເວັບ
window.addEventListener('DOMContentLoaded', () => {
    window.loadTeachers();
});
// 1. ໂຫຼດລາຍຊື່ຫ້ອງຮຽນຈາກ Firebase Firestore
window.loadClasses = async function() {
    const tbody = document.getElementById('classes-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px;">ກຳລັງໂຫຼດຂໍ້ມູນ...</td></tr>`;

    try {
        const querySnapshot = await getDocs(collection(db, "classes"));
        tbody.innerHTML = '';

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px;">ຍັງບໍ່ມີຂໍ້ມູນຫ້ອງຮຽນໃນລະບົບ</td></tr>`;
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            const docId = documentSnapshot.id;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${data.level || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold; color: #007bff;">${data.name || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${data.teacher || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                    <button onclick="editClass('${docId}', '${data.level}', '${data.name}', '${data.teacher}')" style="background: #ffc107; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                    <button onclick="deleteClass('${docId}')" style="background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error loading classes: ", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px; color: red;">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</td></tr>`;
    }
}

// 2. ຈັດການການສົ່ງຟອມ (ເພີ່ມ ຫຼື ອັບເດດຫ້ອງຮຽນ)
const classForm = document.getElementById('class-form');
if (classForm) {
    classForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('class-doc-id').value;
        const level = document.getElementById('class-level').value;
        const name = document.getElementById('class-name').value;
        const teacher = document.getElementById('class-teacher').value;

        try {
            if (docId) {
                // ອັບເດດຂໍ້ມູນ
                await updateDoc(doc(db, "classes", docId), { level: level, name: name, teacher: teacher });
                alert('✅ ແກ້ໄຂຂໍ້ມູນຫ້ອງຮຽນສຳເລັດ!');
            } else {
                // ເພີ່ມໃໝ່
                await addDoc(collection(db, "classes"), { level: level, name: name, teacher: teacher });
                alert('✅ ເພີ່ມຫ້ອງຮຽນສຳເລັດ!');
            }
            window.resetClassForm();
            window.loadClasses();
        } catch (error) {
            console.error("Error saving class: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດ: ' + error.message);
        }
    });
}

// 3. ນຳຂໍ້ມູນມາໃສ່ຟອມເພື່ອແກ້ໄຂ
window.editClass = function(docId, level, name, teacher) {
    document.getElementById('class-doc-id').value = docId;
    document.getElementById('class-level').value = level;
    document.getElementById('class-name').value = name;
    document.getElementById('class-teacher').value = teacher;
    
    document.getElementById('save-class-btn').innerText = 'ອັບເດດຫ້ອງ';
    document.getElementById('cancel-class-edit-btn').style.display = 'inline-block';
}

// 4. ລົບຫ້ອງຮຽນ
window.deleteClass = async function(docId) {
    if (confirm('ທ່ານຕ້ອງການລົບຫ້ອງຮຽນນີ້ແທ້ບໍ?')) {
        try {
            await deleteDoc(doc(db, "classes", docId));
            alert('✅ ລົບຫ້ອງຮຽນສຳເລັດ!');
            window.loadClasses();
        } catch (error) {
            console.error("Error deleting class: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດໃນການລົບ');
        }
    }
}

// 5. ຣີເຊັດຟອມຫ້ອງຮຽນ
window.resetClassForm = function() {
    const form = document.getElementById('class-form');
    if (form) form.reset();
    document.getElementById('class-doc-id').value = '';
    document.getElementById('save-class-btn').innerText = 'ບັນທຶກຫ້ອງ';
    document.getElementById('cancel-class-edit-btn').style.display = 'none';
}

// ເອີ້ນໃຊ້ຟັງຊັນໂຫຼດຂໍ້ມູນຫ້ອງຮຽນຕອນເປີດໜ້າເວັບ
window.addEventListener('DOMContentLoaded', () => {
    window.loadClasses();
});

// ບັນທຶກຂໍ້ມູນນັກຮຽນ (ເພີ່ມ ຫຼື ອັບເດດ)
const studentForm = document.getElementById('student-form');
if (studentForm) {
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('student-doc-id').value;
        const studentId = document.getElementById('student-id').value;
        const name = document.getElementById('student-name').value;
        const grade = document.getElementById('student-grade').value;
        const phone = document.getElementById('student-phone').value;
        const parent = document.getElementById('student-parent').value;

        try {
            if (docId) {
                // ອັບເດດຂໍ້ມູນ
                await updateDoc(doc(db, "students", docId), { 
                    id: studentId, name: name, grade: grade, phone: phone, parent: parent 
                });
                alert('✅ ແກ້ໄຂຂໍ້ມູນນັກຮຽນສຳເລັດ!');
            } else {
                // ເเพີ່ມໃໝ່
                await addDoc(collection(db, "students"), { 
                    id: studentId, name: name, grade: grade, phone: phone, parent: parent 
                });
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

// ສະແດງຜົນລົງຕາຕະລາງ HTML
function renderStudentsTable(students) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 15px;">ບໍ່ພົບຂໍ້ມູນນັກຮຽນ</td></tr>`;
        return;
    }

    students.forEach((student) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${student.id || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${student.name || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${student.grade || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${student.phone || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${student.parent || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                <button onclick="editStudent('${student.docId}', '${student.id || ''}', '${student.name || ''}', '${student.grade || ''}', '${student.phone || ''}', '${student.parent || ''}')" style="background: #ffc107; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                <button onclick="deleteStudent('${student.docId}')" style="background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ນຳຂໍ້ມູນມາໃສ່ຟອມເພື່ອແກ້ໄຂ
window.editStudent = function(docId, id, name, grade, phone, parent) {
    document.getElementById('student-doc-id').value = docId;
    document.getElementById('student-id').value = id;
    document.getElementById('student-name').value = name;
    document.getElementById('student-grade').value = grade;
    document.getElementById('student-phone').value = phone;
    document.getElementById('student-parent').value = parent;
    
    document.getElementById('student-form-title').innerText = '✏️ ແກ້ໄຂຂໍ້ມູນນັກຮຽນ';
    document.getElementById('save-student-btn').innerText = 'ອັບເດດຂໍ້ມູນ';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
}

// ຣີເຊັດຟອມນັກຮຽນ
window.resetStudentForm = function() {
    const form = document.getElementById('student-form');
    if (form) form.reset();
    document.getElementById('student-doc-id').value = '';
    document.getElementById('student-form-title').innerText = '➕ ເພີ່ມຂໍ້ມູນນັກຮຽນໃໝ່';
    document.getElementById('save-student-btn').innerText = 'ບັນທຶກຂໍ້ມູນ';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

// ຟັງຊັນຄົ້ນຫາ ແລະ ກອງຊັ້ນຮຽນ
window.filterStudents = function() {
    const keyword = document.getElementById('search-student-input').value.toLowerCase();
    const selectedGrade = document.getElementById('filter-grade-select').value;
    
    const filtered = allStudentsData.filter(s => {
        const matchKeyword = (s.name && s.name.toLowerCase().includes(keyword)) || 
                             (s.id && s.id.toLowerCase().includes(keyword)) ||
                             (s.phone && s.phone.toLowerCase().includes(keyword));
        const matchGrade = selectedGrade === "" || s.grade === selectedGrade;
        return matchKeyword && matchGrade;
    });
    // ເກັບຂໍ້ມູນຄະແນນທັງໝົດສຳລັບການຄົ້ນຫາ
let allScoresData = [];

// 1. ໂຫຼດລາຍຊື່ຄະແນນຈາກ Firebase Firestore
window.loadScores = async function() {
    const tbody = document.getElementById('scores-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 15px;">ກຳລັງໂຫຼດຂໍ້ມູນ...</td></tr>`;

    try {
        const querySnapshot = await getDocs(collection(db, "scores"));
        tbody.innerHTML = '';
        allScoresData = [];

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 15px;">ຍັງບໍ່ມີຂໍ້ມູນຄະແນນໃນລະບົບ</td></tr>`;
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            data.docId = documentSnapshot.id;
            allScoresData.push(data);
        });

        renderScoresTable(allScoresData);
    } catch (error) {
        console.error("Error loading scores: ", error);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 15px; color: red;">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</td></tr>`;
    }
}

// 2. ຄິດໄລ່ເກຣດຕາມຄະແນນລວມ
function calculateGrade(total) {
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    return 'F';
}

// 3. ສະແດງຜົນລົງຕາຕະລາງ HTML
function renderScoresTable(scores) {
    const tbody = document.getElementById('scores-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (scores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 15px;">ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ</td></tr>`;
        return;
    }

    scores.forEach((s) => {
        const midterm = parseFloat(s.midterm) || 0;
        const final = parseFloat(s.final) || 0;
        const total = midterm + final;
        const grade = calculateGrade(total);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">${s.studentName || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${s.grade || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${s.subject || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${midterm}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${final}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold; color: #28a745;">${total}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold; color: #007bff;">${grade}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                <button onclick="editScore('${s.docId}', '${s.studentName || ''}', '${s.grade || ''}', '${s.subject || ''}', ${midterm}, ${final})" style="background: #ffc107; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                <button onclick="deleteScore('${s.docId}')" style="background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 4. ຈັດການການສົ່ງຟອມ (ເພີ່ມ ຫຼື ອັບເດດຄະແນນ)
const scoreForm = document.getElementById('score-form');
if (scoreForm) {
    scoreForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('score-doc-id').value;
        const studentName = document.getElementById('score-student-name').value;
        const grade = document.getElementById('score-grade').value;
        const subject = document.getElementById('score-subject').value;
        const midterm = parseFloat(document.getElementById('score-midterm').value);
        const final = parseFloat(document.getElementById('score-final').value);

        try {
            if (docId) {
                // ອັບເດດຂໍ້ມູນ
                await updateDoc(doc(db, "scores", docId), { studentName, grade, subject, midterm, final });
                alert('✅ ແກ້ໄຂຄະແນນສຳເລັດ!');
            } else {
                // ເພີ່ມໃໝ່
                await addDoc(collection(db, "scores"), { studentName, grade, subject, midterm, final });
                alert('✅ ບັນທຶກຄະແນນສຳເລັດ!');
            }
            window.resetScoreForm();
            window.loadScores();
        } catch (error) {
            console.error("Error saving score: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດ: ' + error.message);
        }
    });
}

// 5. ນຳຂໍ້ມູນມາໃສ່ຟອມເພື່ອແກ້ໄຂ
window.editScore = function(docId, studentName, grade, subject, midterm, final) {
    document.getElementById('score-doc-id').value = docId;
    document.getElementById('score-student-name').value = studentName;
    document.getElementById('score-grade').value = grade;
    document.getElementById('score-subject').value = subject;
    document.getElementById('score-midterm').value = midterm;
    document.getElementById('score-final').value = final;
    
    document.getElementById('score-form-title').innerText = '✏️ ແກ້ໄຂຄະແນນນັກຮຽນ';
    document.getElementById('save-score-btn').innerText = 'ອັບເດດຄະແນນ';
    document.getElementById('cancel-score-edit-btn').style.display = 'inline-block';
}

// 6. ລົບຄະແນນ
window.deleteScore = async function(docId) {
    if (confirm('ທ່ານຕ້ອງການລົບລາຍການຄະແນນນີ້ແທ້ບໍ?')) {
        try {
            await deleteDoc(doc(db, "scores", docId));
            alert('✅ ລົບຄະແນນສຳເລັດ!');
            window.loadScores();
        } catch (error) {
            console.error("Error deleting score: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດໃນການລົບ');
        }
    }
}

// 7. ຣີເຊັດຟອມຄະແນນ
window.resetScoreForm = function() {
    const form = document.getElementById('score-form');
    if (form) form.reset();
    document.getElementById('score-doc-id').value = '';
    document.getElementById('score-form-title').innerText = '➕ ບັນທຶກຄະແນນນັກຮຽນ';
    document.getElementById('save-score-btn').innerText = 'ບັນທຶກຄະແນນ';
    document.getElementById('cancel-score-edit-btn').style.display = 'none';
}

// 8. ຄົ້ນຫາຄະແນນ
window.filterScores = function() {
    const keyword = document.getElementById('search-score-input').value.toLowerCase();
    const filtered = allScoresData.filter(s => 
        (s.studentName && s.studentName.toLowerCase().includes(keyword)) || 
        (s.subject && s.subject.toLowerCase().includes(keyword)) ||
        (s.grade && s.grade.toLowerCase().includes(keyword))
    );
    renderScoresTable(filtered);
}

// ເອີ້ນໃຊ້ຟັງຊັນໂຫຼດຄະແນນຕອນເປີດໜ້າເວັບ
window.addEventListener('DOMContentLoaded', () => {
    window.loadScores();
});
    
    renderStudentsTable(filtered);
}
