import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    deleteDoc, 
    doc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAZvZSKb9JQAwu6fbzbYxApudX3MwxRYss",
    authDomain: "my-school-c1104.firebaseapp.com",
    projectId: "my-school-c1104",
    storageBucket: "my-school-c1104.appspot.com",
    messagingSenderId: "339930418459",
    appId: "1:339930418459:web:3dd86db9d280c6cb0cd7be",
    measurementId: "G-NPNFSW2C72"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const studentsCol = collection(db, "students");
const teachersCol = collection(db, "teachers");
const attendanceCol = collection(db, "attendance");

let allStudents = [];
let allTeachers = [];
let currentLoginType = '';

// ================= ລະບົບປ໊ອບອັບລັອກອິນ =================
window.openLoginModal = function(type) {
    currentLoginType = type;
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('login-title').innerText = type === 'teacher' ? '👩‍🏫 ລັອກອິນສຳລັບຄູອາຈານ' : '👨‍🎓 ລັອກອິນສຳລັບນັກຮຽນ';
    document.getElementById('login-input-id').value = '';
}

window.closeLoginModal = function() {
    document.getElementById('login-modal').style.display = 'none';
}

window.logout = function() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
}

// ຢືນຢັນການລັອກອິນ
document.getElementById('btn-confirm-login').addEventListener('click', function() {
    const inputId = document.getElementById('login-input-id').value.trim();

    if (!inputId) {
        alert('ກະລຸນາປ້ອນລະຫັດ!');
        return;
    }

    if (currentLoginType === 'teacher') {
        // ກວດສອບລະຫັດຄູ (ຖ້າປ້ອນ T001 ຫຼື ຜ່ານ Firebase)
        const foundTeacher = allTeachers.find(t => t.id.toLowerCase() === inputId.toLowerCase());
        
        // ຜ່ອນຜັນໃຫ້ລັອກອິນໄດ້ ຖ້າພົບໃນລະບົບ ຫຼື ຕັ້ງ Admin ໄວ້
        if (foundTeacher || inputId === 'admin') {
            startApp('teacher', foundTeacher ? foundTeacher.name : 'ຜູ້ບໍລິຫານ (Admin)');
        } else {
            alert('❌ ບໍ່ພົບລະຫັດຄູໃນລະບົບ! (ລອງເພີ່ມຂໍ້ມູນຄູກ່ອນ)');
        }
    } else {
        // ກວດສອບລະຫັດນັກຮຽນ
        const foundStudent = allStudents.find(s => s.id.toLowerCase() === inputId.toLowerCase());

        if (foundStudent) {
            startApp('student', foundStudent);
        } else {
            alert('❌ ບໍ່ພົບລະຫັດນັກຮຽນນີ້ໃນລະບົບ!');
        }
    }
});

// ເລີ່ມຕົ້ນລະບົບຫຼັງບ້ານຕາມສິດ
function startApp(role, userData) {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';

    const menu = document.getElementById('sidebar-menu');
    menu.innerHTML = '';

    if (role === 'teacher') {
        document.getElementById('user-role-title').innerText = '👩‍🏫 ລະບົບຄູ: ' + userData;
        menu.innerHTML = `
            <li class="active" data-target="dashboard">📊 ໜ້າຫຼັກ (Dashboard)</li>
            <li data-target="students">👨‍🎓 ຈັດການນັກຮຽນ</li>
            <li data-target="teachers">👩‍🏫 ຈັດການຄູອາຈານ</li>
            <li data-target="attendance">📝 ເຊັກຊື່ມາຮຽນ</li>
        `;
        showSection('dashboard');
    } else {
        document.getElementById('user-role-title').innerText = '👨‍🎓 ນັກຮຽນ: ' + userData.name;
        menu.innerHTML = `
            <li class="active" data-target="student-portal">🎓 ຜົນການຮຽນ</li>
        `;
        
        // ສະແດງຂໍ້ມູນນັກຮຽນ
        document.getElementById('lbl-stu-name').innerText = userData.name;
        document.getElementById('lbl-stu-id').innerText = userData.id;
        document.getElementById('lbl-stu-grade').innerText = userData.grade;
        
        showSection('student-portal');
    }

    // ຜູກ Event ປ່ຽນໜ້າເມນູ
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            showSection(targetId);
            document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

// ================= Real-time Firebase Data =================
onSnapshot(studentsCol, (snapshot) => {
    allStudents = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    renderStudents(allStudents);
    document.getElementById('total-students').innerText = allStudents.length + ' ຄົນ';
});

onSnapshot(teachersCol, (snapshot) => {
    allTeachers = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    renderTeachers(allTeachers);
    document.getElementById('total-teachers').innerText = allTeachers.length + ' ຄົນ';
});

function renderStudents(data) {
    const tbody = document.getElementById('student-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach((student) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id || ''}</td>
            <td>${student.name || ''}</td>
            <td>${student.grade || ''}</td>
            <td>${student.phone || ''}</td>
            <td><button class="btn-delete" data-id="${student.docId}">ລຶບ</button></td>
        `;
        tr.querySelector('.btn-delete').addEventListener('click', () => deleteDoc(doc(db, "students", student.docId)));
        tbody.appendChild(tr);
    });
}

function renderTeachers(data) {
    const tbody = document.getElementById('teacher-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach((teacher) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${teacher.id || ''}</td>
            <td>${teacher.name || ''}</td>
            <td>${teacher.subject || ''}</td>
            <td>${teacher.phone || ''}</td>
            <td><button class="btn-delete" data-id="${teacher.docId}">ລຶບ</button></td>
        `;
        tr.querySelector('.btn-delete').addEventListener('click', () => deleteDoc(doc(db, "teachers", teacher.docId)));
        tbody.appendChild(tr);
    });
}

// Form Submit ຕ່າງໆ
document.getElementById('student-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    await addDoc(studentsCol, {
        id: document.getElementById('stu-id').value,
        name: document.getElementById('stu-name').value,
        grade: document.getElementById('stu-grade').value,
        phone: document.getElementById('stu-phone').value
    });
    this.reset();
});

document.getElementById('teacher-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    await addDoc(teachersCol, {
        id: document.getElementById('tea-id').value,
        name: document.getElementById('tea-name').value,
        subject: document.getElementById('tea-subject').value,
        phone: document.getElementById('tea-phone').value
    });
    this.reset();
});

// Attendance Logic
const attendanceDateInput = document.getElementById('attendance-date');
if (attendanceDateInput) attendanceDateInput.valueAsDate = new Date();

const gradeSelect = document.getElementById('select-grade-attendance');
if (gradeSelect) {
    gradeSelect.addEventListener('change', function() {
        const selectedGrade = this.value;
        const tbody = document.getElementById('attendance-student-list');
        const saveBtn = document.getElementById('save-attendance-btn');

        if (!selectedGrade) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">ກະລຸນາເລືອກຊັ້ນຮຽນກ່ອນ...</td></tr>`;
            saveBtn.style.display = 'none';
            return;
        }

        const filtered = allStudents.filter(s => s.grade === selectedGrade);
        tbody.innerHTML = '';
        filtered.forEach(student => {
            tbody.innerHTML += `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.grade}</td>
                    <td>
                        <label><input type="radio" name="status_${student.docId}" value="ມາ" checked> ມາ</label> &nbsp;
                        <label><input type="radio" name="status_${student.docId}" value="ຂາດ"> ຂາດ</label> &nbsp;
                        <label><input type="radio" name="status_${student.docId}" value="ລາ"> ລາ</label>
                    </td>
                </tr>`;
        });
        saveBtn.style.display = filtered.length > 0 ? 'block' : 'none';
    });
}


// ຮັບປະກັນວ່າ HTML ໂຫຼດຄົບແລ້ວ ຈຶ່ງຜູກ Event ໃຫ້ປຸ່ມຕ่างໆ
document.addEventListener('DOMContentLoaded', () => {
    const btnTeacher = document.getElementById('btn-open-teacher-login');
    const btnStudent = document.getElementById('btn-open-student-login');
    const btnClose = document.getElementById('btn-close-modal');

    if (btnTeacher) {
        btnTeacher.addEventListener('click', () => {
            window.openLoginModal('teacher');
        });
    }

    if (btnStudent) {
        btnStudent.addEventListener('click', () => {
            window.openLoginModal('student');
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            window.closeLoginModal();
        });
    }
});
