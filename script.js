import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    deleteDoc, 
    doc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔑 ໃສ່ Firebase Config ຂອງທ່ານທີ່ນີ້
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

// ================= ລະບົບສະຫຼັບເມນູ =================
document.querySelectorAll('.nav-links li').forEach(item => {
    item.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');

        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        this.classList.add('active');
    });
});

// ================= ຈັດການຂໍ້ມູນນັກຮຽນ =================
onSnapshot(studentsCol, (snapshot) => {
    allStudents = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
    }));
    renderStudents(allStudents);
    document.getElementById('total-students').innerText = allStudents.length + ' ຄົນ';
});

function renderStudents(data) {
    const tbody = document.getElementById('student-list');
    tbody.innerHTML = '';

    data.forEach((student) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id || ''}</td>
            <td>${student.name || ''}</td>
            <td>${student.grade || ''}</td>
            <td>${student.phone || ''}</td>
            <td>
                <button class="btn-delete" data-id="${student.docId}">ລຶບ</button>
            </td>
        `;
        tr.querySelector('.btn-delete').addEventListener('click', () => deleteStudent(student.docId));
        tbody.appendChild(tr);
    });
}

document.getElementById('student-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    btn.disabled = true;
    btn.innerText = 'ກຳລັງບັນທຶກ...';

    try {
        await addDoc(studentsCol, {
            id: document.getElementById('stu-id').value,
            name: document.getElementById('stu-name').value,
            grade: document.getElementById('stu-grade').value,
            phone: document.getElementById('stu-phone').value,
            createdAt: new Date()
        });
        this.reset();
    } catch (error) {
        alert("ເກີດຂໍ້ຜິດພາດ: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = '+ ເພີ່ມຂໍ້ມູນ';
    }
});

async function deleteStudent(docId) {
    if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນນັກຮຽນຄົນນີ້?')) {
        try {
            await deleteDoc(doc(db, "students", docId));
        } catch (error) {
            alert("ລຶບບໍ່ສຳເລັດ: " + error.message);
        }
    }
}

document.getElementById('search-student').addEventListener('keyup', function() {
    const keyword = this.value.toLowerCase();
    const filtered = allStudents.filter(s => 
        (s.name && s.name.toLowerCase().includes(keyword)) || 
        (s.id && s.id.toLowerCase().includes(keyword))
    );
    renderStudents(filtered);
});

// ================= ຈັດການຂໍ້ມູນຄູອາຈານ =================
onSnapshot(teachersCol, (snapshot) => {
    allTeachers = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
    }));
    renderTeachers(allTeachers);
    document.getElementById('total-teachers').innerText = allTeachers.length + ' ຄົນ';
});

function renderTeachers(data) {
    const tbody = document.getElementById('teacher-list');
    tbody.innerHTML = '';

    data.forEach((teacher) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${teacher.id || ''}</td>
            <td>${teacher.name || ''}</td>
            <td>${teacher.subject || ''}</td>
            <td>${teacher.phone || ''}</td>
            <td>
                <button class="btn-delete" data-id="${teacher.docId}">ລຶບ</button>
            </td>
        `;
        tr.querySelector('.btn-delete').addEventListener('click', () => deleteTeacher(teacher.docId));
        tbody.appendChild(tr);
    });
}

document.getElementById('teacher-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    btn.disabled = true;
    btn.innerText = 'ກຳລັງບັນທຶກ...';

    try {
        await addDoc(teachersCol, {
            id: document.getElementById('tea-id').value,
            name: document.getElementById('tea-name').value,
            subject: document.getElementById('tea-subject').value,
            phone: document.getElementById('tea-phone').value,
            createdAt: new Date()
        });
        this.reset();
    } catch (error) {
        alert("ເກີດຂໍ້ຜິດພາດ: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = '+ ເພີ່ມຂໍ້ມູນ';
    }
});

async function deleteTeacher(docId) {
    if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຄູອາຈານທ່ານນີ້?')) {
        try {
            await deleteDoc(doc(db, "teachers", docId));
        } catch (error) {
            alert("ລຶບບໍ່ສຳເລັດ: " + error.message);
        }
    }
}

// ================= ລະບົບເຊັກຊື່ມາຮຽນ (Attendance) =================
const attendanceDateInput = document.getElementById('attendance-date');
attendanceDateInput.valueAsDate = new Date(); // ຕັ້ງຄ່າວັນທີປັດຈຸບັນ

document.getElementById('select-grade-attendance').addEventListener('change', function() {
    const selectedGrade = this.value;
    const tbody = document.getElementById('attendance-student-list');
    const saveBtn = document.getElementById('save-attendance-btn');

    if (!selectedGrade) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">ກະລຸນາເລືອກຊັ້ນຮຽນກ່ອນ...</td></tr>`;
        saveBtn.style.display = 'none';
        return;
    }

    // กรองเฉพาะนักเรียนในชั้นที่เลือก
    const filteredStudents = allStudents.filter(s => s.grade === selectedGrade);

    if (filteredStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">ບໍ່ມີຂໍ້ມູນນັກຮຽນໃນຊັ້ນ ${selectedGrade} ນີ້</td></tr>`;
        saveBtn.style.display = 'none';
        return;
    }

    tbody.innerHTML = '';
    filteredStudents.forEach((student) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.grade}</td>
            <td>
                <label><input type="radio" name="status_${student.docId}" value="ມາ" checked> ມາ</label> &nbsp;
                <label><input type="radio" name="status_${student.docId}" value="ຂາດ"> ຂາດ</label> &nbsp;
                <label><input type="radio" name="status_${student.docId}" value="ລາ"> ລາ</label>
            </td>
        `;
        tbody.appendChild(tr);
    });

    saveBtn.style.display = 'block';
});

// บันทึกผลการเช็คชื่อลง Firebase
document.getElementById('save-attendance-btn').addEventListener('click', async function() {
    const selectedGrade = document.getElementById('select-grade-attendance').value;
    const dateStr = attendanceDateInput.value;
    const filteredStudents = allStudents.filter(s => s.grade === selectedGrade);

    if (!dateStr) {
        alert('ກະລຸນາເລືອກວັນທີ!');
        return;
    }

    this.disabled = true;
    this.innerText = 'ກຳລັງບັນທຶກ...';

    try {
        for (let student of filteredStudents) {
            const radios = document.getElementsByName(`status_${student.docId}`);
            let status = 'ມາ';
            for (let r of radios) {
                if (r.checked) {
                    status = r.value;
                    break;
                }
            }

            // บันทึกลง Collection attendance
            await addDoc(attendanceCol, {
                studentId: student.id,
                studentName: student.name,
                grade: student.grade,
                status: status,
                date: dateStr,
                createdAt: new Date()
            });
        }
        alert('ບັນທຶກການເຊັກຊື່ສຳເລັດຮຽບຮ້ອຍ!');
    } catch (error) {
        alert('ເກີດຂໍ້ຜິດພາດ: ' + error.message);
    } finally {
        this.disabled = false;
        this.innerText = '💾 ບັນທຶກການເຊັກຊື່';
    }
});
