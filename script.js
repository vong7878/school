import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    deleteDoc, 
    doc, 
    onSnapshot,
    query,
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =================================================================
// 1. ວາງຂໍ້ມູນ firebaseConfig ຂອງທ່ານໃສ່ບ່ອນນີ້ (ເອົາມາຈາກ Firebase Console)
// =================================================================
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// ເລີ່ມຕົ້ນເຊື່ອມຕໍ່ Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ອ້າງອີງຫາ Collections ໃນ Firestore
const studentsCol = collection(db, "students");
const teachersCol = collection(db, "teachers");

let allStudents = []; // ເກັບຂໍ້ມູນຊົ່ວຄາວໄວ້ສຳລັບຄົ້ນຫາ
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

// ================= ຈັດການຂໍ້ມູນນັກຮຽນ (Real-time) =================

// ດຶງຂໍ້ມູນນັກຮຽນແບບ Real-time (ອັບເດດອັດຕະໂນມັດເມື່ອຂໍ້ມູນປ່ຽນ)
onSnapshot(studentsCol, (snapshot) => {
    allStudents = snapshot.docs.map(doc => ({
        docId: doc.id, // ID ຂອງເອກະສານໃນ Firebase
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
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.grade}</td>
            <td>${student.phone}</td>
            <td>
                <button class="btn-delete" data-id="${student.docId}">ລຶບ</button>
            </td>
        `;
        
        // ຜູກ Event ປຸ່ມລຶບ
        tr.querySelector('.btn-delete').addEventListener('click', () => deleteStudent(student.docId));
        tbody.appendChild(tr);
    });
}

// ເພີ່ມຂໍ້ມູນນັກຮຽນລົງ Firebase
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
        alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = '+ ເພີ່ມຂໍ້ມູນ';
    }
});

// ລຶບຂໍ້ມູນນັກຮຽນອອກຈາກ Firebase
async function deleteStudent(docId) {
    if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນນັກຮຽນຄົນນີ້?')) {
        try {
            await deleteDoc(doc(db, "students", docId));
        } catch (error) {
            alert("ລຶບບໍ່ສຳເລັດ: " + error.message);
        }
    }
}

// ຄົ້ນຫານັກຮຽນ
document.getElementById('search-student').addEventListener('keyup', function() {
    const keyword = this.value.toLowerCase();
    const filtered = allStudents.filter(s => 
        s.name.toLowerCase().includes(keyword) || 
        s.id.toLowerCase().includes(keyword)
    );
    renderStudents(filtered);
});

// ================= ຈັດການຂໍ້ມູນຄູອາຈານ (Real-time) =================

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
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${teacher.subject}</td>
            <td>${teacher.phone}</td>
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
