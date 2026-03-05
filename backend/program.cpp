#include <iostream>
#include <vector>

using namespace std;

class Student {

public:

    int id;
    string name;
    int marks;

    Student(int i, string n, int m) {
        id = i;
        name = n;
        marks = m;
    }

    void display() {

        cout << "ID: " << id << endl;
        cout << "Name: " << name << endl;
        cout << "Marks: " << marks << endl;
        cout << "----------------" << endl;

    }

};

double average(vector<Student> students) {

    int total = 0;

    for (int i = 0; i < students.size(); i++) {

        total += students[i].marks;

    }

    return total / students.size();

}

Student topper(vector<Student> students) {

    Student top = students[0];

    for (int i = 1; i < students.size(); i++) {

        if (students[i].marks > top.marks) {

            top = students[i];

        }

    }

    return top;

}

int main() {

    vector<Student> students;

    students.push_back(Student(1, "Rahul", 85));
    students.push_back(Student(2, "Kumar", 92));
    students.push_back(Student(3, "Anita", 78));
    students.push_back(Student(4, "Ravi", 88));

    for (int i = 0; i < students.size(); i++) {

        students[i].display();

    }

    cout << "Average: " << average(students) << endl

    // ERROR HERE missing ;

}