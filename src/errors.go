package main

import (
	"net/http"
)

const (
	DefaultError 	= "Internal Server Error"
	AccessError 	= "Access Denied"
)

var (
	StatusDefaultError	= http.StatusInternalServerError
	StatusAccessError	= http.StatusForbidden
)

