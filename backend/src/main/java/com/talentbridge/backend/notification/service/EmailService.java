package com.talentbridge.backend.notification.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendInterviewRoundEmail(String toEmail, String candidateName, String jobTitle, 
                                       String companyName, String roundName, String status, 
                                       String scheduledDate, String mode, String locationOrLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Interview Round Update - TalentBridge");
            
            String emailBody = String.format(
                "Hello %s,\n\n" +
                "Your application for %s at %s has been updated.\n\n" +
                "Round: %s\n" +
                "Status: %s\n" +
                "Scheduled On: %s\n" +
                "Mode: %s\n" +
                "%s: %s\n\n" +
                "Please check your TalentBridge dashboard for more details.\n\n" +
                "Best of luck!\n" +
                "TalentBridge Team",
                candidateName,
                jobTitle,
                companyName,
                roundName,
                status,
                scheduledDate,
                mode,
                mode.equalsIgnoreCase("ONLINE") ? "Meeting Link" : "Location",
                locationOrLink != null ? locationOrLink : "To be announced"
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to: " + toEmail);
            e.printStackTrace();
        }
    }

    public void sendNewRoundEmail(String toEmail, String candidateName, String jobTitle, 
                                  String companyName, String roundName, String scheduledDate, 
                                  String mode, String locationOrLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("New Interview Round Scheduled - TalentBridge");
            
            String emailBody = String.format(
                "Hello %s,\n\n" +
                "Congratulations! A new interview round has been scheduled for your application to %s at %s.\n\n" +
                "Round: %s\n" +
                "Scheduled On: %s\n" +
                "Mode: %s\n" +
                "%s: %s\n\n" +
                "Please check your TalentBridge dashboard for more details and prepare accordingly.\n\n" +
                "Best of luck!\n" +
                "TalentBridge Team",
                candidateName,
                jobTitle,
                companyName,
                roundName,
                scheduledDate,
                mode,
                mode.equalsIgnoreCase("ONLINE") ? "Meeting Link" : "Location",
                locationOrLink != null ? locationOrLink : "To be announced"
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            System.out.println("New round email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send new round email to: " + toEmail);
            e.printStackTrace();
        }
    }

    public void sendInterviewRoundUpdateEmail(String toEmail, String candidateName, String jobTitle, 
                                           String roundName, String scheduledDate, String mode, String locationOrLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Interview Round Updated - TalentBridge");
            
            String emailBody = String.format(
                "Hello %s,\n\n" +
                "Your interview round for %s has been updated.\n\n" +
                "Round: %s\n" +
                "Scheduled On: %s\n" +
                "Mode: %s\n" +
                "%s: %s\n\n" +
                "Please check your TalentBridge dashboard for more details.\n\n" +
                "Best of luck!\n" +
                "TalentBridge Team",
                candidateName,
                jobTitle,
                roundName,
                scheduledDate,
                mode,
                mode.equalsIgnoreCase("ONLINE") ? "Meeting Link" : "Location",
                locationOrLink != null ? locationOrLink : "To be announced"
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            System.out.println("Interview round update email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send interview round update email to: " + toEmail);
            e.printStackTrace();
        }
    }
}