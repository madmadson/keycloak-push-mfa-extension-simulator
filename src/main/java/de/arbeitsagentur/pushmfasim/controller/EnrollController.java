package de.arbeitsagentur.pushmfasim.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class EnrollController {


    @GetMapping(path = "/enroll")
    public String showEnrollPage() {
        return "enroll-page";
    }

}
