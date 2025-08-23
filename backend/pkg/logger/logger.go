package logger

import (
	"os"

	"github.com/sirupsen/logrus"
)

type Logger interface {
	Info(args ...interface{})
	Error(args ...interface{})
	Fatal(args ...interface{})
	Debug(args ...interface{})
	Warn(args ...interface{})
}

type logger struct {
	*logrus.Logger
}

func NewLogger() Logger {
	log := logrus.New()
	
	// Set output to stdout
	log.SetOutput(os.Stdout)
	
	// Set log level
	level := os.Getenv("LOG_LEVEL")
	switch level {
	case "debug":
		log.SetLevel(logrus.DebugLevel)
	case "info":
		log.SetLevel(logrus.InfoLevel)
	case "warn":
		log.SetLevel(logrus.WarnLevel)
	case "error":
		log.SetLevel(logrus.ErrorLevel)
	default:
		log.SetLevel(logrus.InfoLevel)
	}
	
	// Set formatter
	log.SetFormatter(&logrus.JSONFormatter{})
	
	return &logger{log}
}

func (l *logger) Info(args ...interface{}) {
	l.Logger.Info(args...)
}

func (l *logger) Error(args ...interface{}) {
	l.Logger.Error(args...)
}

func (l *logger) Fatal(args ...interface{}) {
	l.Logger.Fatal(args...)
}

func (l *logger) Debug(args ...interface{}) {
	l.Logger.Debug(args...)
}

func (l *logger) Warn(args ...interface{}) {
	l.Logger.Warn(args...)
} 