// 1. ນຳເຂົ້າ Firebase SDK ທີ່ຈຳເປັນ
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ໃຫ້ແນ່ໃຈວ່າບໍ່ມີ } ຕົກຄ້າງຢູ່ບ່ອນນີ້
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

// 3. ເລີ່ມຕົ້ນ Firebase App ແລະ Firestore (ປະກາດ db ພຽງຄັ້ງດຽວເທົ່ານັ້ນ!)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ຕົວແປເກັບຂໍ້ມູນລວມສຳລັບการຄົ້ນຫາ
let allStudentsData = [];
let allTeachersData = [];
let allScoresData = [];
let allFinancesData = [];
window.showSection = function(sectionId) {
    // 1. ซ່ອນທຸກ Section ກ່ອນ
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => {
        sec.style.display = 'none';
    });

    // 2. ສະແດງສະເພາະ Section ທີ່ຖືກເລືອກ (ໃຊ້ sectionId ທີ່ສົ່ງມາໂດຍກົງ)
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
    } else {
        console.warn('ບໍ່ພົບ Section ID: ' + sectionId);
    }
};

// ຟັງຊັນອອກຈາກລະບົບ (Logout)
window.logout = function() {
    localStorage.clear();
    alert('🚪 ອອກຈາກລະບົບສຳເລັດ!');
    window.location.href = 'index.html';
}

// ==========================================
// 5. ໂມດູນຈັດການນັກຮຽນ (Students Management)
// ==========================================
window.loadStudents = async function() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 15px;">ກຳລັງໂຫຼດຂໍ້ມູນ...</td></tr>`;

    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        tbody.innerHTML = '';
        allStudentsData = [];

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 15px;">ຍັງບໍ່ມີຂໍ້ມູນນັກຮຽນໃນລະບົບ</td></tr>`;
            const dashStudents = document.getElementById('dash-total-students');
            if (dashStudents) dashStudents.innerText = '0 ຄົນ';
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            data.docId = documentSnapshot.id;
            allStudentsData.push(data);
        });

        const dashStudents = document.getElementById('dash-total-students');
        if (dashStudents) dashStudents.innerText = allStudentsData.length + ' ຄົນ';

        renderStudentsTable(allStudentsData);
    } catch (error) {
        console.error("Error loading students: ", error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 15px; color: red;">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</td></tr>`;
    }
}

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
                await updateDoc(doc(db, "students", docId), { id: studentId, name, grade, phone, parent });
                alert('✅ ແກ້ໄຂຂໍ້ມູນນັກຮຽນສຳເລັດ!');
            } else {
                await addDoc(collection(db, "students"), { id: studentId, name, grade, phone, parent });
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

window.resetStudentForm = function() {
    const form = document.getElementById('student-form');
    if (form) form.reset();
    document.getElementById('student-doc-id').value = '';
    document.getElementById('student-form-title').innerText = '➕ ເພີ່ມຂໍ້ມູນນັກຮຽນໃໝ່';
    document.getElementById('save-student-btn').innerText = 'ບັນທຶກຂໍ້ມູນ';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

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
    renderStudentsTable(filtered);
}


// ==========================================
// 6. ໂມດູນຈັດການຄູອາຈານ (Teachers Management)
// ==========================================
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

        const dashTeachers = document.getElementById('dash-total-teachers');
        if (dashTeachers) dashTeachers.innerText = allTeachersData.length + ' ຄົນ';

        renderTeachersTable(allTeachersData);
    } catch (error) {
        console.error("Error loading teachers: ", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px; color: red;">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</td></tr>`;
    }
}

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
                await updateDoc(doc(db, "teachers", docId), { id: teacherId, name, subject });
                alert('✅ ແກ້ໄຂຂໍ້ມູນຄູສຳເລັດ!');
            } else {
                await addDoc(collection(db, "teachers"), { id: teacherId, name, subject });
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

window.editTeacher = function(docId, id, name, subject) {
    document.getElementById('teacher-doc-id').value = docId;
    document.getElementById('teacher-id').value = id;
    document.getElementById('teacher-name').value = name;
    document.getElementById('teacher-subject').value = subject;
    
    document.getElementById('teacher-form-title').innerText = '✏️ ແກ້ໄຂຂໍ້ມູນຄູອາຈານ';
    document.getElementById('save-teacher-btn').innerText = 'ອັບເດດຂໍ້ມູນ';
    document.getElementById('cancel-teacher-edit-btn').style.display = 'inline-block';
}

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

window.resetTeacherForm = function() {
    const form = document.getElementById('teacher-form');
    if (form) form.reset();
    document.getElementById('teacher-doc-id').value = '';
    document.getElementById('teacher-form-title').innerText = '➕ ເພີ່ມຂໍ້ມູນຄູອາຈານໃໝ່';
    document.getElementById('save-teacher-btn').innerText = 'ບັນທຶກຂໍ້ມູນ';
    document.getElementById('cancel-teacher-edit-btn').style.display = 'none';
}

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


// ==========================================
// 7. ໂມດູນຈັດການຫ້ອງຮຽນ (Classes Management - Firebase v10 Modular)
// ==========================================
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
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;" class="action-col">
                    <button onclick="viewClassStudents('${docId}', '${data.name || ''}')" style="background: #17a2b8; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">👥 ເບິ່ງນັກຮຽນ</button>
                    <button onclick="editClass('${docId}', '${data.level || ''}', '${data.name || ''}', '${data.teacher || ''}')" style="background: #ffc107; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                    <button onclick="deleteClass('${docId}')" style="background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        const role = localStorage.getItem('userRole');
        if (role === 'student') {
            const formContainer = document.getElementById('class-form-container');
            if (formContainer) formContainer.style.display = 'none';
        }

    } catch (error) {
        console.error("Error loading classes: ", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px; color: red;">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</td></tr>`;
    }
}
const classForm = document.getElementById('class-form');
if (classForm) {
    classForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('class-doc-id') ? document.getElementById('class-doc-id').value : '';
        const level = document.getElementById('class-level') ? document.getElementById('class-level').value : '';
        const name = document.getElementById('class-name') ? document.getElementById('class-name').value : '';
        const teacher = document.getElementById('class-teacher') ? document.getElementById('class-teacher').value : '';

        try {
            if (docId) {
                await updateDoc(doc(db, "classes", docId), { level, name, teacher });
                alert('✅ ແກ້ໄຂຂໍ້ມູນຫ້ອງຮຽນສຳເລັດ!');
            } else {
                await addDoc(collection(db, "classes"), { level, name, teacher, createdAt: serverTimestamp() });
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

window.editClass = function(docId, level, name, teacher) {
    if(document.getElementById('class-doc-id')) document.getElementById('class-doc-id').value = docId;
    if(document.getElementById('class-level')) document.getElementById('class-level').value = level;
    if(document.getElementById('class-name')) document.getElementById('class-name').value = name;
    if(document.getElementById('class-teacher')) document.getElementById('class-teacher').value = teacher;
    
    const saveBtn = document.getElementById('save-class-btn');
    const cancelBtn = document.getElementById('cancel-class-edit-btn');
    if(saveBtn) saveBtn.innerText = 'ອັບເດດຫ້ອງ';
    if(cancelBtn) cancelBtn.style.display = 'inline-block';
}

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

window.resetClassForm = function() {
    const form = document.getElementById('class-form');
    if (form) form.reset();
    if(document.getElementById('class-doc-id')) document.getElementById('class-doc-id').value = '';
    const saveBtn = document.getElementById('save-class-btn');
    const cancelBtn = document.getElementById('cancel-class-edit-btn');
    if(saveBtn) saveBtn.innerText = 'ບັນທຶກຫ້ອງ';
    if(cancelBtn) cancelBtn.style.display = 'none';
}

window.viewClassStudents = async function(classId, className) {
    try {
        const querySnapshot = await getDocs(collection(db, 'students'));
        let studentListHtml = `<h3>👥 ລາຍຊື່ນັກຮຽນໃນຫ້ອງ: ${className}</h3>`;
        
        let foundCount = 0;
        let listHtml = `<ul style="padding-left: 20px; text-align: left;">`;
        
        querySnapshot.forEach((docSnap) => {
            const sData = docSnap.data();
            if (sData.classId === classId || sData.grade === className) {
                foundCount++;
                listHtml += `<li>${sData.name || 'ບໍ່ມີຊື່'} (ລະຫັດ: ${sData.id || sData.studentId || '-'})</li>`;
            }
        });
        listHtml += `</ul>`;

        if (foundCount === 0) {
            studentListHtml += `<p>ຍັງບໍ່ມີນັກຮຽນໃນຫ້ອງນີ້.</p>`;
        } else {
            studentListHtml += listHtml;
        }

        let modal = document.getElementById('student-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'student-modal';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 8px; width: 400px; max-width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                ${studentListHtml}
                <button onclick="document.getElementById('student-modal').style.display='none'" style="margin-top: 15px; background: #6c757d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; width: 100%;">ປິດ</button>
            </div>
        `;
        modal.style.display = 'flex';

    } catch (error) {
        console.error('Error loading students: ', error);
        alert('❌ ບໍ່ສາມາດໂຫຼດລາຍຊື່ນັກຮຽນໄດ້');
    }
}


// ==========================================
// 8. ໂມດູນຈັດການຄະແນນ (Scores Management)
// ==========================================
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

function calculateGrade(total) {
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    return 'F';
}

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
                await updateDoc(doc(db, "scores", docId), { studentName, grade, subject, midterm, final });
                alert('✅ ແກ້ໄຂຄະແນນສຳເລັດ!');
            } else {
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

window.resetScoreForm = function() {
    const form = document.getElementById('score-form');
    if (form) form.reset();
    document.getElementById('score-doc-id').value = '';
    document.getElementById('score-form-title').innerText = '➕ ບັນທຶກຄະແນນນັກຮຽນ';
    document.getElementById('save-score-btn').innerText = 'ບັນທຶກຄະແນນ';
    document.getElementById('cancel-score-edit-btn').style.display = 'none';
}

window.filterScores = function() {
    const keyword = document.getElementById('search-score-input').value.toLowerCase();
    const filtered = allScoresData.filter(s => 
        (s.studentName && s.studentName.toLowerCase().includes(keyword)) || 
        (s.subject && s.subject.toLowerCase().includes(keyword)) ||
        (s.grade && s.grade.toLowerCase().includes(keyword))
    );
    renderScoresTable(filtered);
}


// ==========================================
// 9. ໂມດູນການເງິນ & ຄ່າຮຽນ (Finance Management)
// ==========================================
window.loadFinances = async function() {
    const tbody = document.getElementById('finances-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 15px;">ກຳລັງໂຫຼດຂໍ້ມູນ...</td></tr>`;

    try {
        const querySnapshot = await getDocs(collection(db, "finances"));
        tbody.innerHTML = '';
        allFinancesData = [];

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 15px;">ຍັງບໍ່ມີຂໍ້ມູນການເງິນໃນລະບົບ</td></tr>`;
            if(document.getElementById('total-income')) document.getElementById('total-income').innerText = '0 ₭';
            if(document.getElementById('total-pending')) document.getElementById('total-pending').innerText = '0 ₭';
            if(document.getElementById('total-finance-records')) document.getElementById('total-finance-records').innerText = '0 ລາຍການ';
            return;
        }

        let totalIncome = 0;
        let totalPending = 0;

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            data.docId = documentSnapshot.id;
            allFinancesData.push(data);

            const amount = parseFloat(data.amount) || 0;
            if (data.status === 'ຈ່າຍແລ້ວ') {
                totalIncome += amount;
            } else {
                totalPending += amount;
            }
        });

        if(document.getElementById('total-income')) document.getElementById('total-income').innerText = totalIncome.toLocaleString() + ' ₭';
        if(document.getElementById('total-pending')) document.getElementById('total-pending').innerText = totalPending.toLocaleString() + ' ₭';
        if(document.getElementById('total-finance-records')) document.getElementById('total-finance-records').innerText = allFinancesData.length + ' ລາຍການ';

        renderFinancesTable(allFinancesData);
    } catch (error) {
        console.error("Error loading finances: ", error);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 15px; color: red;">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</td></tr>`;
    }
}

function renderFinancesTable(finances) {
    const tbody = document.getElementById('finances-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (finances.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 15px;">ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ</td></tr>`;
        return;
    }

    finances.forEach((f) => {
        const amount = parseFloat(f.amount) || 0;
        const statusColor = f.status === 'ຈ່າຍແລ້ວ' ? '#28a745' : '#dc3545';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">${f.studentName || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${f.grade || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${amount.toLocaleString()} ₭</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold; color: ${statusColor};">${f.status || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                <button onclick="editFinance('${f.docId}', '${f.studentName || ''}', '${f.grade || ''}', ${amount}, '${f.status || ''}')" style="background: #ffc107; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                <button onclick="deleteFinance('${f.docId}')" style="background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

const financeForm = document.getElementById('finance-form');
if (financeForm) {
    financeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('finance-doc-id').value;
        const studentName = document.getElementById('finance-student-name').value;
        const grade = document.getElementById('finance-grade').value;
        const amount = parseFloat(document.getElementById('finance-amount').value);
        const status = document.getElementById('finance-status').value;

        try {
            if (docId) {
                await updateDoc(doc(db, "finances", docId), { studentName, grade, amount, status });
                alert('✅ ແກ້ໄຂຂໍ້ມູນການເງິນສຳເລັດ!');
            } else {
                await addDoc(collection(db, "finances"), { studentName, grade, amount, status });
                alert('✅ ບັນທຶກຂໍ້ມູນການເງິນສຳເລັດ!');
            }
            window.resetFinanceForm();
            window.loadFinances();
        } catch (error) {
            console.error("Error saving finance: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດ: ' + error.message);
        }
    });
}

window.editFinance = function(docId, studentName, grade, amount, status) {
    document.getElementById('finance-doc-id').value = docId;
    document.getElementById('finance-student-name').value = studentName;
    document.getElementById('finance-grade').value = grade;
    document.getElementById('finance-amount').value = amount;
    document.getElementById('finance-status').value = status;
    
    document.getElementById('finance-form-title').innerText = '✏️ ແກ້ໄຂຂໍ້ມູນການຊຳລະຄ່າຮຽນ';
    document.getElementById('save-finance-btn').innerText = 'ອັບເດດຂໍ້ມູນ';
    document.getElementById('cancel-finance-edit-btn').style.display = 'inline-block';
}

window.deleteFinance = async function(docId) {
    if (confirm('ທ່ານຕ້ອງການລົບລາຍການການເງິນນີ້ແທ້ບໍ?')) {
        try {
            await deleteDoc(doc(db, "finances", docId));
            alert('✅ ລົບຂໍ້ມູນສຳເລັດ!');
            window.loadFinances();
        } catch (error) {
            console.error("Error deleting finance: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດໃນການລົບ');
        }
    }
}

window.resetFinanceForm = function() {
    const form = document.getElementById('finance-form');
    if (form) form.reset();
    document.getElementById('finance-doc-id').value = '';
    document.getElementById('finance-form-title').innerText = '➕ ບັນທຶກການຊຳລະຄ່າຮຽນ';
    document.getElementById('save-finance-btn').innerText = 'ບັນທຶກຂໍ້ມູນ';
    document.getElementById('cancel-finance-edit-btn').style.display = 'none';
}

window.filterFinances = function() {
    const keyword = document.getElementById('search-finance-input').value.toLowerCase();
    const filtered = allFinancesData.filter(f => 
        (f.studentName && f.studentName.toLowerCase().includes(keyword)) || 
        (f.grade && f.grade.toLowerCase().includes(keyword))
    );
    renderFinancesTable(filtered);
}


// ==========================================
// 10. ໂຫຼດຂໍ້ມູນທັງໝົດຕອນເປີດໜ້າເວັບ
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    if (window.loadStudents) window.loadStudents();
    if (window.loadTeachers) window.loadTeachers();
    if (window.loadClasses) window.loadClasses();
    if (window.loadScores) window.loadScores();
    if (window.loadFinances) window.loadFinances();
    if (window.applyRolePermissions) window.applyRolePermissions();
    if (typeof loadTimetables === 'function') loadTimetables();
    if (typeof loadNews === 'function') loadNews();
if (typeof showSection === 'function') {
            showSection('dashboard'); // ໃຫ້ໃຊ້ 'dashboard' ໂດຍບໍ່ຕ້ອງມີ prefix 'section-' ເພາະຟັງຊັນຕື່ມໃຫ້ແລ້ວ
        }
    }); // ວົງເລັບປິດຂອງ DOMContentLoaded ແລະ addEventListener


// ==========================================
// 11. ລະບົບຄວບຄຸມສິດຜູ້ໃຊ້ (Role-Based Access Control)
// ==========================================
window.applyRolePermissions = function() {
    const role = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName') || 'User';

    if (!role) {
        window.location.href = 'login.html';
        return;
    }

    const nameSpan = document.getElementById('user-display-name');
    const roleSpan = document.getElementById('user-display-role');
    if (nameSpan) nameSpan.innerText = userName;
    if (roleSpan) roleSpan.innerText = role.toUpperCase();

    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        userDisplay.innerText = `👤 ${userName} (${role.toUpperCase()})`;
    }

    if (role === 'student') {
        const menusToHide = ['menu-dashboard', 'menu-students', 'menu-teachers', 'menu-attendance', 'menu-scores'];
        menusToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const formsToHide = ['student-form', 'teacher-form', 'class-form', 'score-form', 'finance-form', 'news-form'];
        formsToHide.forEach(id => {
            const form = document.getElementById(id);
            if (form && form.parentElement) {
                form.parentElement.style.display = 'none';
            }
        });

        document.querySelectorAll('button').forEach(btn => {
            const text = btn.innerText.toLowerCase();
            if (!text.includes('ອອກຈາກລະບົບ') && !text.includes('ຊຳລະ') && !text.includes('ປິດ')) {
                btn.style.display = 'none';
            }
        });

        if (typeof showSection === 'function') {
            showSection('classes');
        }
    }
}


// ==========================================
// 12. ໂມດູນຈັດການຂ່າວສານ (News Management)
// ==========================================
const newsForm = document.getElementById('news-form');
if (newsForm) {
    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('news-doc-id').value;
        const title = document.getElementById('news-title').value;
        const content = document.getElementById('news-content').value;

        try {
            if (docId) {
                await updateDoc(doc(db, "news", docId), { title, content });
                alert('✅ ແກ້ໄຂປະກາດສຳເລັດ!');
            } else {
                await addDoc(collection(db, "news"), {
                    title, content,
                    date: new Date().toLocaleDateString('lo-LA'),
                    createdAt: serverTimestamp()
                });
                alert('📢 ເຜີຍແຜ່ປະກາດຂ່າວສານສຳເລັດ!');
            }

            resetNewsForm();
            loadNews();
        } catch (error) {
            console.error("Error saving news: ", error);
            alert('❌ ເກີດຂໍ້ຜິດພາດ: ' + error.message);
        }
    });
}

async function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    try {
        const querySnapshot = await getDocs(collection(db, "news"));
        let html = '';
        const userRole = localStorage.getItem('userRole') || 'student';
        const canManage = (userRole === 'admin' || userRole === 'teacher');

        if (querySnapshot.empty) {
            container.innerHTML = `<p style="text-align: center; color: #666;">ຍັງບໍ່ມີປະກາດຂ່າວສານໃນລະບົບ</p>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const id = docSnap.id;
            html += `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 5px 0; color: #333;">📢 ${item.title}</h4>
                    <p style="color: #666; font-size: 13px; margin: 0 0 10px 0;">ວັນທີ່: ${item.date || 'ບໍ່ລະບຸ'}</p>
                    <p style="margin: 0 0 10px 0; white-space: pre-line;">${item.content}</p>
                    ${canManage ? `
                        <div style="display: flex; gap: 5px;">
                            <button onclick="editNews('${id}', '${item.title.replace(/'/g, "\\'")}', '${item.content.replace(/'/g, "\\'")}')" style="background: #ffc107; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">✏️ ແກ້ໄຂ</button>
                            <button onclick="deleteNews('${id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">🗑️ ລົບ</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error("Error loading news: ", error);
    }
}

function editNews(id, title, content) {
    document.getElementById('news-doc-id').value = id;
    document.getElementById('news-title').value = title;
    document.getElementById('news-content').value = content;

    document.getElementById('news-form-title').innerText = '✏️ ແກ້ໄຂປະກາດຂ່າວສານ';
    document.getElementById('save-news-btn').innerText = '💾 ບັນທຶກການແກ້ໄຂ';
    document.getElementById('cancel-news-edit-btn').style.display = 'inline-block';
}

async function deleteNews(id) {
    if (confirm('⚠️ ທ່ານຕ້ອງການລົບປະກາດນີ້ແທ້ບໍ?')) {
        try {
            await deleteDoc(doc(db, "news", id));
            alert('🗑️ ລົບປະກາດສຳເລັດ!');
            loadNews();
        } catch (error) {
            console.error("Error deleting news: ", error);
        }
    }
}

function resetNewsForm() {
    document.getElementById('news-form').reset();
    document.getElementById('news-doc-id').value = '';
    document.getElementById('news-form-title').innerText = '➕ ສ້າງປະກາດຂ່າວສານໃໝ່';
    document.getElementById('save-news-btn').innerText = 'ເຜີຍແຜ່ປະກາດ';
    document.getElementById('cancel-news-edit-btn').style.display = 'none';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}




// ==========================================
// 📅 ໂມດູນຈັດການ ແລະ ເບິ່ງຕາຕະລາງຮຽນ (Timetable Module)
// ==========================================

// 1. ບັນທຶກ ຫຼື ເພີ່ມ/ແກ້ໄຂ ຕາຕະລາງຮຽນລົງ Firebase Firestore
window.saveTimetableData = async function(event) {
    if (event) event.preventDefault();

    const docId = document.getElementById('timetable-doc-id').value;
    const room = document.getElementById('timetable-class-room').value;
    const subject = document.getElementById('timetable-subject').value;
    const day = document.getElementById('timetable-day').value;
    const time = document.getElementById('timetable-time').value;
    const teacher = document.getElementById('timetable-teacher').value;

    if (!room || !subject || !day || !time || !teacher) {
        alert('⚠️ ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ!');
        return;
    }

    try {
        if (docId) {
            await updateDoc(doc(db, "timetables", docId), { room, subject, day, time, teacher });
            alert('✅ ແກ້ໄຂຕາຕະລາງຮຽນສຳເລັດ!');
        } else {
            await addDoc(collection(db, "timetables"), {
                room, subject, day, time, teacher,
                createdAt: serverTimestamp()
            });
            alert('✅ ເພີ່ມຕາຕະລາງຮຽນສຳເລັດ!');
        }

        document.getElementById('timetable-form').reset();
        document.getElementById('timetable-doc-id').value = '';
        resetTimetableForm();
        loadTimetables();
    } catch (error) {
        console.error("Error saving timetable: ", error);
        alert('❌ ບັນທຶກບໍ່ສຳເລັດ: ' + error.message);
    }
};

// 2. ຟັງຊັ່ນໂຫຼດ ແລະ ສະແດງຕາຕະລາງຮຽນໃນໜ້າເວັບ
window.loadTimetables = async function() {
    const tbody = document.getElementById('timetable-table-body');
    if (!tbody) return;

    try {
        const querySnapshot = await getDocs(collection(db, "timetables"));
        let html = '';
        const userRole = localStorage.getItem('userRole') || 'student';
        const canManage = (userRole === 'admin' || userRole === 'teacher');

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 15px; color: #666;">ບໍ່ມີຂໍ້ມູນຕາຕະລາງຮຽນ</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const id = docSnap.id;
            html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold; color: #007bff;">${item.room || ''}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${item.subject || ''}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${item.day || ''}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${item.time || ''}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${item.teacher || ''}</td>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                        ${canManage ? `
                            <button type="button" onclick="editTimetable('${id}', '${item.room || ''}', '${item.subject || ''}', '${item.day || ''}', '${item.time || ''}', '${item.teacher || ''}')" style="background: #ffc107; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;" title="ແກ້ໄຂ">✏️</button>
                            <button type="button" onclick="deleteTimetable('${id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" title="ລົບ">🗑️</button>
                        ` : '<span style="color: #888; font-size: 12px;">ເບິ່ງຢ່າງດຽວ</span>'}
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (error) {
        console.error("Error loading timetables: ", error);
    }
};

// 3. ນຳຂໍ້ມູນມາວາງໃສ່ຟອມເພື່ອແກ້ໄຂ
window.editTimetable = function(id, room, subject, day, time, teacher) {
    document.getElementById('timetable-doc-id').value = id;
    document.getElementById('timetable-class-room').value = room;
    document.getElementById('timetable-subject').value = subject;
    document.getElementById('timetable-day').value = day;
    document.getElementById('timetable-time').value = time;
    document.getElementById('timetable-teacher').value = teacher;

    document.getElementById('class-form-title').innerText = '✏️ ແກ້ໄຂຕາຕະລາງຮຽນ';
    document.getElementById('save-timetable-btn').innerText = '💾 ບັນທຶກການແກ້ໄຂ';
    document.getElementById('cancel-timetable-edit-btn').style.display = 'inline-block';
};

// 4. ລົບຕາຕະລາງຮຽນ
window.deleteTimetable = async function(id) {
    if (confirm('⚠️ ທ່ານຕ້ອງການລົບຕາຕະລາງນີ້ແທ້ບໍ?')) {
        try {
            await deleteDoc(doc(db, "timetables", id));
            alert('🗑️ ລົບສຳເລັດ!');
            loadTimetables();
        } catch (error) {
            console.error("Error deleting timetable: ", error);
        }
    }


// 5. ຣີເຊັດຟອມ
window.resetTimetableForm = function() {
    const form = document.getElementById('timetable-form');
    if (form) form.reset();
    document.getElementById('timetable-doc-id').value = '';
    document.getElementById('class-form-title').innerText = '➕ ເພີ່ມຕາຕະລາງຮຽນໃໝ່';
    document.getElementById('save-timetable-btn').innerText = '💾 ບັນທຶກຕາຕະລາງ';
    document.getElementById('cancel-timetable-edit-btn').style.display = 'none';
};
