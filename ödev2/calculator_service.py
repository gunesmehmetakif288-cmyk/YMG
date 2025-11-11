import math

class CalculatorService:
    @staticmethod
    def calculate(islem, sayi1, sayi2=None):
        islem = islem.lower()

        if islem == "toplama":
            return sayi1 + sayi2
        elif islem == "çıkarma":
            return sayi1 - sayi2
        elif islem == "çarpma":
            return sayi1 * sayi2
        elif islem == "bölme":
            if sayi2 == 0:
                raise ValueError("Sıfıra bölünemez!")
            return sayi1 / sayi2
        elif islem == "üs":
            return math.pow(sayi1, sayi2)
        elif islem == "karekök":
            if sayi1 < 0:
                raise ValueError("Negatif sayının karekökü alınamaz!")
            return math.sqrt(sayi1)
        else:
            raise ValueError("Geçersiz işlem türü!")
