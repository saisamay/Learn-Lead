public class Main {

  static class Student {

    int id;
    String name;
    int marks;

    Student(int id, String name, int marks) {
      this.id = id;
      this.name = name;
      this.marks = marks;
    }

    void display() {
      System.out.println("ID: " + id);
      System.out.println("Name: " + name);
      System.out.println("Marks: " + marks);
      System.out.println("----------------");
    }

  }

  public static double average(Student[] students) {

    int total = 0;

    for (int i = 0; i < students.length; i++) {
      total += students[i].marks;
    }

    return total / students.length;
  }

  public static Student topper(Student[] students) {

    Student top = students[0];

    for (int i = 1; i < students.length; i++) {

      if (students[i].marks > top.marks) {
        top = students[i];
      }

    }

    return top;

  }

  public static void main(String[] args) {

    Student[] students = {

      new Student(1, "Rahul", 85),
      new Student(2, "Kumar", 92),
      new Student(3, "Anita", 78),
      new Student(4, "Ravi", 88)

    };

    for (Student s : students) {
      s.display();
    }

    double avg = average(students);

    System.out.println("Average: " + avg)

    // ERROR HERE missing ;

  }

}