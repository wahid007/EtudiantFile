import java.io.Serializable;

public class Etudiant implements Serializable{
	private String Nom;
	private String Prenom;
	private int AnneeNais;
	
	public Etudiant(String Nom, String Prenom, int AnneeNais) {
		this.Nom = Nom;
		this.Prenom = Prenom;
		this.AnneeNais = AnneeNais;
	}
	
	public int age(int anneeEnCours) {
		return anneeEnCours - this.AnneeNais;
	}

	@Override
	public String toString() {
		return "Etudiant [Nom=" + Nom + ", Prenom=" + Prenom + ", AnneeNais=" + AnneeNais + "]";
	}

}
