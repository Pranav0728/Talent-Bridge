package com.talentbridge.backend.jobs.model;

import com.talentbridge.backend.recruiter.model.Recruiter;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;


    @Column(name = "job_title")  // map to DB column
    private String jobTitle;

    @Column(length = 5000)
    private String description;
    private String location;
    private String job_type; 
    private Double salary;

    @ElementCollection
    private List<String> skills;

    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    @ManyToOne
    @JoinColumn(name = "recruiter_id", nullable = false)
    private Recruiter recruiter;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        updated_at = LocalDateTime.now();
        extractSkills();
    }

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
        extractSkills();
    }

    private void extractSkills() {
        if (description == null || description.isEmpty()) {
            return;
        }

        // Common tech skills to look for
        String[] commonSkills = {
            "Java", "Python", "JavaScript", "React", "Node.js", "NodeJS", "Spring Boot", "Spring",
            "SQL", "MySQL", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Git",
            "HTML", "CSS", "TypeScript", "Angular", "Vue", "Django", "Flask",
            "C++", "C#", ".NET", "Rest API", "GraphQL", "Redis", "Linux",
            "Machine Learning", "AI", "Data Science", "DevOps", "Agile", "Scrum","healthcare"
        };

        if (this.skills == null) {
            this.skills = new ArrayList<>();
        } else {
            this.skills.clear(); 
        }

        String lowerDesc = description.toLowerCase();

        for (String skill : commonSkills) {
            if (lowerDesc.contains(skill.toLowerCase())) {
                // Avoid duplicates if multiple variations exist (e.g. Node.js vs NodeJS)
                String normalizedSkill = skill.equalsIgnoreCase("NodeJS") ? "Node.js" : skill;
                if (!this.skills.contains(normalizedSkill)) {
                    this.skills.add(normalizedSkill);
                }
            }
        }
    }

    // getters & setters
    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getJob_type() {
        return job_type;
    }

    public void setJob_type(String job_type) {
        this.job_type = job_type;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public LocalDateTime getUpdated_at() {
        return updated_at;
    }

    public Recruiter getRecruiter() {
        return recruiter;
    }

    public void setRecruiter(Recruiter recruiter) {
        this.recruiter = recruiter;
    }
}
